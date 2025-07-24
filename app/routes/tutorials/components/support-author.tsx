import { SupportMeButton } from "~/components/ui/support-me-button";

export function SupportAuthor() {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border bg-muted border-b p-4">
        <h3 className="font-medium">Support the Author</h3>
      </div>
      <div className="mx-auto flex flex-col items-center p-4">
        <SupportMeButton />
        <p className="text-muted-foreground mt-4 text-center text-xs">
          Your support helps create more content!
        </p>
      </div>
    </div>
  );
}
