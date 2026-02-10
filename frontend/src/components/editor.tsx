"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";

interface EditorProps {
    content?: string;
    onChange?: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
                // Enable markdown shortcuts
                bold: {
                    HTMLAttributes: {
                        class: 'font-bold',
                    },
                },
                italic: {
                    HTMLAttributes: {
                        class: 'italic',
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc ml-6',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal ml-6',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-blue-500 pl-4 italic text-gray-600',
                    },
                },
                horizontalRule: {
                    HTMLAttributes: {
                        class: 'border-gray-300 my-6',
                    },
                },
                code: {
                    HTMLAttributes: {
                        class: 'bg-gray-100 px-1 py-0.5 rounded text-sm',
                    },
                },
            }),
            Typography,
            Placeholder.configure({
                placeholder: "Type '/' for commands, or start writing with markdown...",
            }),
        ],
        content: content || "",
        editorProps: {
            attributes: {
                class:
                    "prose prose-slate prose-sm max-w-none mx-auto focus:outline-none min-h-[500px] p-8 border rounded-md shadow-sm bg-white " +
                    "prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-6 prose-headings:mb-4 " +
                    "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base " +
                    "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 " +
                    "prose-strong:text-gray-900 prose-strong:font-semibold " +
                    "prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 " +
                    "prose-li:text-gray-700 prose-li:my-1 " +
                    "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm " +
                    "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
            },
        },
        onUpdate: ({ editor }) => {
            if (editor.getHTML() !== content) {
                onChange?.(editor.getHTML());
            }
        },
        immediatelyRender: false,
    });

    // Sync content updates from parent
    useEffect(() => {
        if (editor && content !== undefined && editor.getHTML() !== content) {

            // Save current selection
            const { from, to } = editor.state.selection;

            // Update content without emitting another update event
            // @ts-ignore - Tiptap types can be tricky
            editor.commands.setContent(content, { emitUpdate: false });

            // Restore selection safely without scrolling
            const newDocSize = editor.state.doc.content.size;
            const newTo = Math.min(to, newDocSize);
            const newFrom = Math.min(from, newTo);

            try {
                // Use the constructor of the current selection to create a new one
                // This avoids importing TextSelection from @tiptap/pm/state which might not be directly available
                // @ts-ignore
                const SelectionClass = editor.state.selection.constructor;
                // @ts-ignore
                const newSelection = SelectionClass.create(editor.state.doc, newFrom, newTo);

                const tr = editor.state.tr.setSelection(newSelection);
                // Do NOT call scrollIntoView()
                editor.view.dispatch(tr);
            } catch (e) {
                console.warn("Failed to restore selection:", e);
                // Fallback to commands if manual transaction fails
                editor.commands.setTextSelection({ from: newFrom, to: newTo });
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Markdown Shortcuts Info */}
            <div className="flex items-center gap-2 p-3 border rounded-md bg-blue-50 text-blue-700 text-xs">
                <span className="font-semibold">💡 Markdown 단축키:</span>
                <code className="bg-blue-100 px-1 rounded"># + Space</code> = 제목 1
                <code className="bg-blue-100 px-1 rounded">## + Space</code> = 제목 2
                <code className="bg-blue-100 px-1 rounded">**텍스트**</code> = 굵게
                <code className="bg-blue-100 px-1 rounded">- + Space</code> = 리스트
                <code className="bg-blue-100 px-1 rounded">--- + Enter</code> = 구분선
            </div>

            {/* Toolkit Bar */}
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
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`px-2 py-1 text-sm rounded ${editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                >
                    Quote
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
