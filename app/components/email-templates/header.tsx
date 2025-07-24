import React from "react";
import { slogan } from "~/utils/constants";
import * as E from "@react-email/components";

export function Header({ description = slogan }: { description?: string }) {
  return (
    <E.Section className="mb-4 text-center">
      <E.Img
        src="https://cdn.sanity.io/media-libraries/ml4WNZcKpiTm/images/6749aa161e69b57e6d39b2cd430834da255e31bd-1024x1024.png"
        alt="Coding Simba Logo"
        className="mx-auto mb-4 size-16 object-cover"
      />
      <E.Heading as="h1" className="mb-[8px] text-2xl font-bold text-white">
        Coding Simba
      </E.Heading>
      <E.Text className="m-0 text-sm text-gray-400">{description}</E.Text>
    </E.Section>
  );
}
