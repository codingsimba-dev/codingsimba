import bcrypt from "bcryptjs";
import { type Connection, type Password, type User } from "~/generated/prisma";
import { redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { safeRedirect } from "remix-utils/safe-redirect";
import { prisma } from "./db.server";
import type { ProviderUser } from "./providers/provider";
import { providers } from "./connection.server";
import { authSessionStorage } from "./session.server";
import { combineHeaders } from "./misc";
import { EntityType, logEvent } from "./audit-log.server";

export const SESSION_EXPIRATION_TIME = 14 * 24 * 60 * 60 * 1000; // 14 days
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const sessionKey = "sessionId";

export const authenticator = new Authenticator<ProviderUser>();

for (const [providerName, provider] of Object.entries(providers)) {
  const strategy = provider.getAuthStrategy();
  if (strategy) {
    authenticator.use(strategy, providerName);
  }
}

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionId = authSession.get(sessionKey);
  if (!sessionId) return null;
  const session = await prisma.session.findUnique({
    select: { userId: true },
    where: { id: sessionId, expirationDate: { gt: new Date() } },
  });
  if (!session?.userId) {
    throw redirect("/", {
      headers: {
        "set-cookie": await authSessionStorage.destroySession(authSession),
      },
    });
  }
  return session.userId;
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request);
  if (!userId) {
    const requestUrl = new URL(request.url);
    redirectTo =
      redirectTo === null
        ? null
        : (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`);
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
    const loginRedirect = ["/", loginParams?.toString()]
      .filter(Boolean)
      .join("?");
    throw redirect(loginRedirect);
  }
  return userId;
}

export async function requireUser(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await requireUserId(request, { redirectTo });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    throw signout({ request });
  }
  return user;
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
}

export async function signin({
  email,
  password,
}: {
  email: User["email"];
  password: string;
}) {
  const user = await verifyUserPassword({ email }, password);
  if (!user) return null;
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  });
  return session;
}

export async function signup({
  email,
  password,
  name,
}: {
  email: User["email"];
  name: User["name"];
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);

  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          name,
          email: email.toLowerCase(),
          roles: { connect: { name: "USER" } },
          password: {
            create: {
              hash: hashedPassword,
            },
          },
          notificationSettings: {
            create: {
              contentUpdate: true,
            },
          },
        },
      },
    },
    select: { id: true, expirationDate: true },
  });
  return session;
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function verifyUserPassword(
  where: Pick<User, "email"> | Pick<User, "id">,
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}

export async function signupWithConnection({
  email,
  name,
  providerId,
  providerName,
  // imageUrl,
}: {
  email: User["email"];
  name: User["name"];
  providerId: Connection["providerId"];
  providerName: Connection["providerName"];
  imageUrl?: string;
}) {
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      roles: { connect: { name: "USER" } },
      connections: { create: { providerId, providerName } },
      notificationSettings: {
        create: {
          contentUpdate: true,
        },
      },
      // ...(imageUrl && { image: imageUrl }),
    },
    select: { id: true },
  });

  // Create and return the session
  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
    select: { id: true, expirationDate: true },
  });

  return session;
}

export async function signout(
  {
    request,
    redirectTo = "/",
  }: {
    request: Request;
    redirectTo?: string;
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionId = authSession.get(sessionKey);

  if (sessionId) {
    void prisma.session
      .deleteMany({ where: { id: sessionId } })
      .catch(() => {});
  }
  throw redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      { "set-cookie": await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  });
}

/**
 * Convenience function for logging authentication events
 */
export async function logAuthEvent({
  action,
  userId,
  success,
  error,
  ipAddress,
  userAgent,
}: {
  action: string;
  userId?: string;
  success: boolean;
  error?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  await logEvent({
    action,
    category: "SECURITY",
    module: "USER",
    description: `Authentication ${action.toLowerCase().replace("_", " ")} ${success ? "successful" : "failed"}`,
    severity: success ? "INFO" : "ERROR",
    actorId: userId,
    entityType: EntityType.USER,
    entityId: userId,
    metadata: {
      success,
      error: error ? String(error) : null,
    },
    ipAddress,
    userAgent,
  });
}

export enum AuthAction {
  SIGNED_IN = "SIGNED_IN",
  SIGN_IN_FAILED = "SIGN_IN_FAILED",
  SIGNED_OUT = "SIGNED_OUT",
  SIGN_OUT_FAILED = "SIGN_OUT_FAILED",
  SIGNED_UP = "SIGNED_UP",
  SIGN_UP_FAILED = "SIGN_UP_FAILED",
  UPDATED_PASSWORD = "UPDATED_PASSWORD",
  UPDATED_PASSWORD_FAILED = "UPDATED_PASSWORD_FAILED",
  UPDATED_EMAIL = "UPDATED_EMAIL",
  UPDATED_EMAIL_FAILED = "UPDATED_EMAIL_FAILED",
  UPDATED_NAME = "UPDATED_NAME",
  UPDATED_NAME_FAILED = "UPDATED_NAME_FAILED",
  UPDATED_IMAGE = "UPDATED_IMAGE",
  UPDATED_IMAGE_FAILED = "UPDATED_IMAGE_FAILED",
}
