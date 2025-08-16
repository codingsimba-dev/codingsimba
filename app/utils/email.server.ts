export const RESEND_URL = "https://api.resend.com" as const;
const { RESEND_API_KEY, RESEND_AUDIENCE_ID } = process.env;

async function callResendApi(data: unknown, endpoint: string) {
  const response = await fetch(`${RESEND_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error(
      `Resend API Error: ${response.status} ${response.statusText}`,
      responseData,
    );
  }

  return { response, data: responseData };
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactNode;
}) {
  try {
    const emailData = {
      from: "TekBreed <info@tekbreed.com>",
      ...options,
    };
    const { response, data } = await callResendApi(emailData, "/emails");
    if (response.ok) {
      return { status: "success", data } as const;
    } else {
      return {
        status: "error",
        error: data?.message ?? response.statusText,
      } as const;
    }
  } catch (error) {
    console.error("Send email error:", error);
    return { status: "error", error: "Failed to send email" } as const;
  }
}

export async function subscribeUser(credentials: {
  name?: string;
  email: string;
}) {
  try {
    const firstName = credentials.name?.split(" ")[0];
    const lastName = credentials.name?.split(" ").slice(1).join(" ");

    const subscriptionData = {
      email: credentials.email,
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      unsubscribed: false,
    };

    const { response, data } = await callResendApi(
      subscriptionData,
      `/audiences/${RESEND_AUDIENCE_ID}/contacts`,
    );

    if (response.ok) {
      return { status: "success", data } as const;
    } else {
      return {
        status: "error",
        error: data?.message ?? response.statusText,
      } as const;
    }
  } catch (error) {
    console.error("Subscribe user error:", error);
    return { status: "error", error: "Failed to subscribe user" } as const;
  }
}
