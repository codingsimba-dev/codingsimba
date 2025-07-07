import { createCookieSessionStorage, redirect } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";
import { combineResponseInits } from "./misc";
import { sessionKey } from "~/utils/auth.server";
import { logSystemEvent, SystemAction } from "./system.server";
import { prisma } from "./db.server";

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__cs_session",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
    secrets: process.env.SESSION_SECRET.split(","),
    ...(process.env.NODE_ENV === "production"
      ? {
          domain: "codingsimba.com",
          secure: true,
        }
      : {}),
  },
});

export async function handleNewSession(
  {
    request,
    session,
    redirectTo,
    rememberMe = undefined,
  }: {
    request: Request;
    session: { userId: string; id: string; expirationDate: Date };
    redirectTo?: string;
    rememberMe?: "true" | undefined;
  },
  responseInit?: ResponseInit,
) {
  // if (await shouldRequestTwoFA({ request, userId: session.userId })) {
  //   const verifySession = await verifySessionStorage.getSession();
  //   verifySession.set(unverifiedSessionIdKey, session.id);
  //   verifySession.set(rememberKey, remember);
  //   const redirectUrl = getRedirectToUrl({
  //     request,
  //     type: twoFAVerificationType,
  //     target: session.userId,
  //   });
  //   return redirect(
  //     redirectUrl.toString(),
  //     combineResponseInits(
  //       {
  //         headers: {
  //           "set-cookie":
  //             await verifySessionStorage.commitSession(verifySession),
  //         },
  //       },
  //       responseInit,
  //     ),
  //   );
  // } else {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session.id);

  return redirect(
    safeRedirect(redirectTo),
    combineResponseInits(
      {
        headers: {
          "set-cookie": await authSessionStorage.commitSession(authSession, {
            expires: rememberMe ? session.expirationDate : undefined,
          }),
        },
      },
      responseInit,
    ),
  );
  // }
}

export async function cleanupExpiredSessions() {
  const now = new Date();
  try {
    const result = await prisma.session.deleteMany({
      where: { expirationDate: { lt: now } },
    });
    const deletedCount = result.count;
    if (deletedCount > 0) {
      await logSystemEvent({
        action: SystemAction.SYSTEM_MAINTENANCE,
        description: `Cleaned up ${deletedCount} expired sessions`,
        metadata: { deletedCount },
      });
    }
    return { success: true, deletedCount, timestamp: now };
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
    await logSystemEvent({
      action: SystemAction.SYSTEM_ERROR,
      description: "Failed to cleanup expired sessions",
      severity: "ERROR",
      metadata: { error: String(error) },
    });
    return { success: false, error: String(error), timestamp: now };
  }
}

export async function getExpiredSessionStats() {
  const now = new Date();
  try {
    const expiredCount = await prisma.session.count({
      where: { expirationDate: { lt: now } },
    });
    const totalCount = await prisma.session.count();
    return { expiredCount, totalCount, timestamp: now };
  } catch (error) {
    console.error("Failed to get expired session stats:", error);
    return { error: String(error), timestamp: now };
  }
}
