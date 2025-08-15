export const RESEND_URL = "https://api.resend.com" as const;
const { RESEND_API_KEY, RESEND_AUDIENCE_ID } = process.env;

async function callResendApi(data: unknown, endpoint: string) {
  return fetch(`${RESEND_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactNode;
}) {
  const emailData = {
    from: "TekBreed <info@tekbreed.com>",
    ...options,
  };
  const response = await callResendApi(emailData, "/emails");
  const data = await response.json();
  if (response.ok) {
    return { status: "success", data } as const;
  } else {
    return { status: "error", error: response.statusText } as const;
  }
}

export async function subscribeUser(credentials: {
  name: string;
  email: string;
}) {
  const subscriptionData = {
    ...credentials,
    unsubscribed: false,
    audienceId: RESEND_AUDIENCE_ID,
  };
  const response = await callResendApi(
    subscriptionData,
    `/${RESEND_AUDIENCE_ID}/contacts`,
  );
  const data = await response.json();
  if (response.ok) {
    return { status: "success", data } as const;
  } else {
    return { status: "error", error: response.statusText } as const;
  }
}
