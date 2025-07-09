import { SupportMeButton } from "~/components/ui/support-me-button";

export function SupportAuthor() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-medium">Support the Author</h3>
      </div>
      <div className="mx-auto flex flex-col items-center p-4">
        <SupportMeButton />
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Your support helps create more content!
        </p>
      </div>
    </div>
  );
}
