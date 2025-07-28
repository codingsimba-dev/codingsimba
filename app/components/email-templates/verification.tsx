import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
  Img,
} from "@react-email/components";
import { getImgSrc } from "~/utils/misc";

export function Verification({
  code = "123456",
  verificationUrl = "https://codingsimba.com/verify?code=123456",
}: {
  code: string;
  verificationUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {code}</Preview>
      <Tailwind>
        <Body className="bg-black py-[40px] font-sans antialiased">
          <Container className="mx-auto max-w-[600px] rounded-[8px] border border-gray-800 bg-[#151516] p-[40px] shadow-lg">
            <Section className="mb-4 text-center">
              <Img
                src={getImgSrc({ fileKey: "tekbreedlogo.png" })}
                alt="TekBreed Logo"
                className="mx-auto mb-4 size-12 object-cover"
              />
              <Heading as="h1" className="text-xl font-bold text-white">
                TekBreed
              </Heading>
              <Text className="mt-1 text-sm text-gray-400">
                Secure Authentication
              </Text>
            </Section>

            <Section className="mb-2">
              <Heading
                as="h2"
                className="mb-2 text-xl font-semibold text-gray-100"
              >
                Your Verification Code
              </Heading>

              <Text className="mb-2 text-base text-gray-300">
                Please use the following code to verify your identity:
              </Text>

              <Section className="mb-2">
                <Container className="rounded-lg bg-gray-700 px-6 py-4 text-center ring-1 ring-gray-600">
                  <Text className="m-0 text-3xl font-bold tracking-wider text-white">
                    {code}
                  </Text>
                </Container>
                <Text className="mt-2 text-center text-xs text-gray-400">
                  Expires in 10 minutes
                </Text>
              </Section>

              <Section className="mb-6">
                <Text className="mb-2 text-sm text-gray-400">
                  Or click this link to verify:
                </Text>
                <Link
                  href={verificationUrl}
                  className="block break-all text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {verificationUrl}
                </Link>
              </Section>

              <Text className="text-sm text-gray-500">
                For your security, please don&apos;t share this code with
                anyone.
              </Text>
            </Section>

            <Section className="border-t border-gray-700 pt-2">
              <Text className="text-xs text-gray-500">
                © 2025 TekBreed. All rights reserved.
              </Text>
              <Text className="mt-4 text-xs text-gray-500">
                <Link
                  href="https://tekbreed.com/privacy"
                  className="ml-2 text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                •
                <Link
                  href="https://tekbreed.com/terms"
                  className="ml-2 text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Terms of Use
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
