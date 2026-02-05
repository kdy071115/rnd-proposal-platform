"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/editor";
import { toast } from "sonner";
import { ArrowLeft, Save, FileText, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { CompanyData } from "@/lib/mock-data";
import { marked } from "marked";

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch document data
    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/documents/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTitle(data.title);

                    // Convert markdown to HTML if content starts with markdown syntax
                    let htmlContent = data.content;
                    if (data.content.includes('# ') || data.content.includes('## ')) {
                        htmlContent = marked(data.content) as string;
                    }
                    setContent(htmlContent);
                } else {
                    toast.error("Document not found");
                }
            } catch (e) {
                console.error("Failed to fetch document", e);
                toast.error("Failed to load document");
            } finally {
                setLoading(false);
            }
        };
        fetchDocument();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/documents/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                }),
            });

            if (res.ok) {
                toast.success("Document updated successfully!");
            } else {
                toast.error("Failed to update document.");
            }
        } catch (e) {
            console.error("Save error", e);
            toast.error("Error saving document.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/documents">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 w-[400px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto min-h-[800px]">
                    <TiptapEditor content={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}
