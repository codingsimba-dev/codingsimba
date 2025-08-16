import { data } from "react-router";
import { type VerifyFunctionArgs } from "../auth/verify.server";
import { newEmailAddressSessionKey } from "./change-email";
import { redirectWithToast } from "~/utils/toast.server";
import { invariant } from "~/utils/misc";
import { verifySessionStorage } from "~/utils/verification.server";
import { prisma } from "~/utils/db.server";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "~/utils/email.server";
import { EmailChangeNotification } from "~/components/email-templates/email-change-notification";
import { format } from "date-fns";

export async function handleVerification({
  request,
  submission,
}: VerifyFunctionArgs) {
  invariant(
    submission.status === "success",
    "Submission should be successful by now",
  );

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const newEmail = verifySession.get(newEmailAddressSessionKey);
  if (!newEmail) {
    return data(
      {
        ...submission.reply({
          formErrors: [
            "You must submit the code on the same device that requested the email change.",
          ],
        }),
      },
      { status: StatusCodes.BAD_REQUEST },
    );
  }
  const userIpAddress =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

  const preUpdateUser = await prisma.user.findFirstOrThrow({
    select: { email: true, name: true },
    where: { id: submission.value.target },
  });
  const user = await prisma.user.update({
    where: { id: submission.value.target },
    select: { id: true, email: true },
    data: { email: newEmail },
  });

  const emailProps = {
    newEmail,
    oldEmail: preUpdateUser.email,
    name: preUpdateUser.name,
    ipAddress: userIpAddress as string,
    changeDate: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
  };

  void sendEmail({
    to: preUpdateUser.email,
    subject: "TekBreed Email changed",
    react: <EmailChangeNotification {...emailProps} />,
  });

  /**
   * TODO: update newsletter user with new email
   */

  return redirectWithToast(
    "/profile",
    {
      title: "Email Changed",
      type: "success",
      description: `Your email has been changed to ${user.email}`,
    },
    {
      headers: {
        "set-cookie": await verifySessionStorage.destroySession(verifySession),
      },
    },
  );
}
