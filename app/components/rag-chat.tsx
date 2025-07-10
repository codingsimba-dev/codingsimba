import React, { useState, useRef } from "react";
import { useFetcher } from "react-router";

interface RAGChatProps {
  documentId?: string;
}

export function RAGChat({ documentId }: RAGChatProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetcher = useFetcher();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer("");
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("question", question);
      if (documentId) {
        formData.append("documentId", documentId);
      }

      const response = await fetch("/rag", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedAnswer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the chunk and add to accumulated answer
        const chunk = decoder.decode(value, { stream: true });
        accumulatedAnswer += chunk;
        setAnswer(accumulatedAnswer);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled, don't show error
        return;
      }
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the course content..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Asking..." : "Ask"}
          </button>
          {isLoading && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {answer && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Answer:</h3>
          <div className="prose max-w-none">
            {answer.split("\n").map((line, index) => (
              <p key={index} className="mb-2">
                {line}
              </p>
            ))}
          </div>
          {isLoading && (
            <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-600">
              |
            </span>
          )}
        </div>
      )}

      {isLoading && !answer && (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Generating answer...</p>
        </div>
      )}
    </div>
  );
}

// Alternative approach using Remix's useFetcher with streaming
export function RAGChatWithFetcher({ documentId }: RAGChatProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const fetcher = useFetcher();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAnswer("");

    const formData = new FormData();
    formData.append("question", question);
    if (documentId) {
      formData.append("documentId", documentId);
    }

    try {
      const response = await fetch("/rag", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedAnswer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedAnswer += chunk;
        setAnswer(accumulatedAnswer);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <fetcher.Form method="post" onSubmit={handleSubmit}>
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </fetcher.Form>

      {answer && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Answer:</h3>
          <div className="whitespace-pre-wrap">{answer}</div>
        </div>
      )}
    </div>
  );
}

// Example usage in a route
export default function RAGPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Learning Assistant</h1>
      <RAGChat />
    </div>
  );
}
