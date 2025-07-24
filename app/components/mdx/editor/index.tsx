import React from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  EditorContent,
  ReactNodeViewRenderer,
  useEditor,
  type Editor as IEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import { MenuBar } from "./menu-bar";
import { CodeBlockComponent } from "./code-block-component";
export interface MenuBarProps {
  editor: IEditor | null;
}

const lowlight = createLowlight(common);

interface EditorProps {
  value?: string;
  setValue?: (value: string) => void;
  placeholder?: string;
}

export function MDXEditor({
  value = "",
  setValue,
  placeholder = "Write your comment here...",
}: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({ lowlight }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[80px] p-2 prose-headings:my-1 prose-p:my-0.5 prose-headings:text-base prose-p:text-sm prose-ul:my-0.5 prose-ol:my-0.5 prose-li:my-0 [&_.ProseMirror]:p-0 [&_.ProseMirror>p]:mt-0 [&_.ProseMirror>p]:mb-0 dark:!text-white dark:prose-headings:!text-white dark:prose-p:!text-white dark:prose-strong:text-white dark:prose-code:text-white dark:prose-pre:text-white dark:prose-blockquote:text-white",
      },
    },
    onUpdate: ({ editor }) => {
      if (!editor.getText() || editor.getText() === "") {
        setValue?.("");
      } else {
        setValue?.(editor.getHTML());
      }
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className="border-border rounded-lg border">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}
