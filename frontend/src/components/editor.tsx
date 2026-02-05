"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface EditorProps {
    content?: string;
    onChange?: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Write your R&D proposal here...",
            }),
        ],
        content: content || "", // Initial content
        editorProps: {
            attributes: {
                class:
                    "prose prose-slate max-w-none mx-auto focus:outline-none min-h-[500px] p-8 border rounded-md shadow-sm bg-white text-sm leading-relaxed",
            },
        },
        onUpdate: ({ editor }) => {
            // Only trigger onChange if content is different to avoid loops
            if (editor.getHTML() !== content) {
                onChange?.(editor.getHTML());
            }
        },
        immediatelyRender: false,
    });

    // Sync content updates from parent (e.g. AI generation)
    useEffect(() => {
        if (editor && content !== undefined && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Toolkit Bar (Simple) */}
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 text-sm rounded ${editor.isActive("bold") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 text-sm rounded ${editor.isActive("italic") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 py-1 text-sm rounded ${editor.isActive("heading", { level: 2 })
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                        }`}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-2 py-1 text-sm rounded ${editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                >
                    List
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
