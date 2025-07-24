import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Code2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading4,
  Heading5,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/utils/misc";

import type { MenuBarProps } from ".";

export function MenuBar({ editor }: MenuBarProps) {
  if (!editor) {
    return <Skeleton className="h-32" />;
  }
  return (
    <div className="border-border bg-background flex flex-wrap items-center gap-1 rounded-lg rounded-bl-none rounded-br-none border-b p-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("bold") && "bg-muted",
        )}
        title="Bold"
        aria-label="Bold"
      >
        <Bold className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("italic") && "bg-muted",
        )}
        title="Italic"
        aria-label="Italic"
      >
        <Italic className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("strike") && "bg-muted",
        )}
        title="Strike"
        aria-label="Strike"
      >
        <Strikethrough className="size-4" />
      </button>
      <div className="bg-border mx-1 h-6 w-px" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("heading", { level: 3 }) && "bg-muted",
        )}
        title="Heading 3"
        aria-label="Heading 3"
      >
        <Heading3 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("heading", { level: 4 }) && "bg-muted",
        )}
        title="Heading 4"
        aria-label="Heading 4"
      >
        <Heading4 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("heading", { level: 5 }) && "bg-muted",
        )}
        title="Heading 5"
        aria-label="Heading 5"
      >
        <Heading5 className="size-4" />
      </button>
      <div className="bg-border mx-1 h-6 w-px" />
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("code") && "bg-muted",
        )}
        title="Code"
        aria-label="Code"
      >
        <Code className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("codeBlock") && "bg-muted",
        )}
        title="Code Block"
        aria-label="Code Block"
      >
        <Code2 className="size-4" />
      </button>
      <div className="bg-border mx-1 h-6 w-px" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("bulletList") && "bg-muted",
        )}
        title="Bullet List"
        aria-label="Bullet List"
      >
        <List className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("orderedList") && "bg-muted",
        )}
        title="Ordered List"
        aria-label="Ordered List"
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "hover:bg-muted rounded p-2",
          editor.isActive("blockquote") && "bg-muted",
        )}
        title="Blockquote"
        aria-label="Blockquote"
      >
        <Quote className="size-4" />
      </button>
      <div className="bg-border mx-1 h-6 w-px" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="hover:bg-muted rounded p-2"
        title="Undo"
        aria-label="Undo"
      >
        <Undo className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="hover:bg-muted rounded p-2"
        title="Redo"
        aria-label="Redo"
      >
        <Redo className="size-4" />
      </button>
    </div>
  );
}
