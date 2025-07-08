import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
  CodeBlock,
  dracula,
} from "@react-email/components";

export const WebhookRetryAlert = (props: {
  webhookUrl: string;
  failureTime: string;
  httpStatusCode: string;
  errorMessage: string;
  payload: string;
  retryCount: number;
  nextRetryTime: string;
  webhookId: string;
  serviceName: string;
}) => {
  const {
    webhookUrl,
    failureTime,
    httpStatusCode,
    errorMessage,
    payload,
    retryCount,
    nextRetryTime,
    webhookId,
    serviceName,
  } = props;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>
          🚨 Webhook Failure Alert - {serviceName} webhook failed
        </Preview>
        <Body className="bg-[#151516] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-black p-[32px] shadow-lg">
            {/* Header */}
            <Section className="mb-[32px] text-center">
              <Text className="m-0 mb-[8px] text-[48px]">🚨</Text>
              <Heading className="m-0 mb-[8px] text-[24px] font-bold text-red-400">
                Webhook Failure Alert
              </Heading>
              <Text className="m-0 text-[16px] text-gray-300">
                A webhook endpoint has failed and requires immediate attention
              </Text>
            </Section>

            <Hr className="my-[24px] border-gray-700" />

            {/* Failure Details */}
            <Section className="mb-[24px]">
              <Heading className="m-0 mb-[16px] text-[18px] font-bold text-gray-100">
                Failure Details
              </Heading>

              <div className="mb-[16px] border-l-[4px] border-red-400 bg-red-900 p-[16px]">
                <Text className="m-0 mb-[4px] text-[14px] font-semibold text-red-300">
                  Service: {serviceName}
                </Text>
                <Text className="m-0 mb-[4px] text-[14px] text-red-200">
                  Webhook URL: {webhookUrl}
                </Text>
                <Text className="m-0 mb-[4px] text-[14px] text-red-200">
                  Failure Time: {failureTime}
                </Text>
                <Text className="m-0 text-[14px] text-red-200">
                  HTTP Status: {httpStatusCode}
                </Text>
              </div>

              <Text className="m-0 mb-[8px] text-[14px] font-semibold text-gray-200">
                Error Message:
              </Text>
              <div className="mb-[16px] rounded-[4px] border border-gray-600 bg-gray-800 p-[12px]">
                <Text className="m-0 font-mono text-[14px] text-red-300">
                  {errorMessage}
                </Text>
              </div>
            </Section>

            {/* Retry Information */}
            <Section className="mb-[24px]">
              <Heading className="m-0 mb-[16px] text-[18px] font-bold text-gray-100">
                Retry Information
              </Heading>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-200">
                <strong>Retry Attempts:</strong> {retryCount}/3
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-200">
                <strong>Next Retry:</strong> {nextRetryTime}
              </Text>
              <Text className="m-0 text-[14px] text-gray-200">
                <strong>Webhook ID:</strong> {webhookId}
              </Text>
            </Section>

            {/* Payload */}
            <Section className="mb-[24px]">
              <Heading className="m-0 mb-[16px] text-[18px] font-bold text-gray-100">
                Request Payload
              </Heading>
              <div className="overflow-auto">
                <CodeBlock
                  code={payload}
                  language="json"
                  theme={dracula}
                  fontFamily="monospace"
                />
              </div>
            </Section>

            <Hr className="my-[24px] border-gray-700" />

            {/* Action Items */}
            <Section className="mb-[24px]">
              <Heading className="m-0 mb-[16px] text-[18px] font-bold text-gray-100">
                Recommended Actions
              </Heading>
              <div className="border-l-[4px] border-blue-400 bg-blue-900 p-[16px]">
                <Text className="m-0 mb-[8px] text-[14px] text-blue-200">
                  • Check the webhook endpoint availability and configuration
                </Text>
                <Text className="m-0 mb-[8px] text-[14px] text-blue-200">
                  • Verify the receiving service is operational
                </Text>
                <Text className="m-0 mb-[8px] text-[14px] text-blue-200">
                  • Review authentication credentials if applicable
                </Text>
                <Text className="m-0 text-[14px] text-blue-200">
                  • Monitor for additional failures from the same endpoint
                </Text>
              </div>
            </Section>

            {/* Quick Links */}
            <Section className="mb-[32px] text-center">
              <Link
                href={`https://dashboard.example.com/webhooks/${webhookId}`}
                className="mr-[12px] box-border inline-block rounded-[6px] bg-blue-500 px-[24px] py-[12px] text-[14px] font-semibold text-white no-underline"
              >
                View Webhook Details
              </Link>
              <Link
                href="https://dashboard.example.com/webhooks/logs"
                className="box-border inline-block rounded-[6px] bg-gray-500 px-[24px] py-[12px] text-[14px] font-semibold text-white no-underline"
              >
                View All Logs
              </Link>
            </Section>

            {/* Footer */}
            <Hr className="my-[24px] border-gray-700" />
            <Section className="text-center">
              <Text className="m-0 mb-[8px] text-[12px] text-gray-400">
                This is an automated alert from your webhook monitoring system.
              </Text>
              <Text className="m-0 mb-[8px] text-[12px] text-gray-400">
                TechCorp Inc, 123 Tech Street, San Francisco, CA 94105
              </Text>
              <Text className="m-0 text-[12px] text-gray-400">
                © {new Date().getFullYear()} TechCorp Inc. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WebhookRetryAlert.PreviewProps = {
  webhookUrl: "https://api.client-service.com/webhook/payments",
  failureTime: "2025-07-08 14:25:30 UTC",
  httpStatusCode: "500 Internal Server Error",
  errorMessage:
    "Connection timeout: Unable to establish connection to webhook endpoint after 30 seconds",
  payload: `{
  "event": "payment.completed",
  "timestamp": "2025-07-08T14:25:00Z",
  "data": {
    "payment_id": "pay_1234567890",
    "amount": 29.99,
    "currency": "USD",
    "status": "completed"
  }
}`,
  retryCount: 2,
  nextRetryTime: "2025-07-08 14:35:30 UTC",
  webhookId: "wh_abc123def456",
  serviceName: "Payment Processing Service",
};
