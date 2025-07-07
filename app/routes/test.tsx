import React from "react";
import { Markdown } from "~/components/mdx";
import { Button } from "~/components/ui/button";
import { useFetcher } from "react-router";
import { bundleMDX } from "~/utils/mdx.server";
import { openai } from "~/utils/openai.server";

export async function action() {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content:
            "write a short concise introduction about react useRef hook, include the code example and the explanation",
        },
      ],
    });
    const completionText = completion.choices[0]?.message?.content;
    console.log("Server - completionText:", completionText);
    const { code } = completionText
      ? await bundleMDX({ source: completionText })
      : { code: "No response from OpenAI" };
    console.log("Server - MDX code:", code);

    return { code };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return { error: "Failed to generate response" };
  }
}

export default function TestRoute() {
  const fetcher = useFetcher();
  const code = fetcher.data?.code;
  console.log("Client - code:", code);

  // const error = actionData?.error;

  return (
    <div className="mt-20">
      {/* {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
          Error: {error}
        </div> */}
      {/* )} */}
      {code ? <Markdown source={code} /> : null}
      <fetcher.Form method="post">
        <input
          type="hidden"
          name="prompt"
          value="write a short concise introduction about react useRef hook, include the code example and the explanation"
        />
        <Button type="submit" disabled={fetcher.state === "submitting"}>
          {fetcher.state === "submitting" ? "Generating..." : "Generate"}
        </Button>
      </fetcher.Form>
    </div>
  );
}
