"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import MarkdownViewer from "@/components/MarkdownViewer";
import { toast } from "sonner";
import { ArrowLeft, Save, FileText, Loader2, Users, Sparkles, Edit } from "lucide-react";
import Link from "next/link";

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [markdownContent, setMarkdownContent] = useState("");  // AI generated markdown
    const [isMarkdownMode, setIsMarkdownMode] = useState(false);  // Toggle between editor and markdown viewer
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    // Fetch user and document data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch current user info for collaboration
                const userRes = await fetch("/api/users/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser({ name: userData.full_name, email: userData.email });
                }

                // Fetch document info
                const res = await fetch(`/api/documents/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTitle(data.title);
                    setContent(data.content || "");
                } else {
                    toast.error("Document not found");
                }
            } catch (e) {
                console.error("Failed to fetch", e);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                toast.success("문서가 저장되었습니다!");
            } else {
                toast.error("저장에 실패했습니다.");
            }
        } catch (e) {
            console.error("Save error", e);
            toast.error("저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateProposal = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem("token");

            // Extract RD notice ID from document title or metadata
            // For now, we'll use a placeholder
            const res = await fetch("/api/generate/rd-proposal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    rd_notice_id: 1 // This should come from document metadata
                }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Raw AI content:", data.content);

                // Convert markdown to HTML for Tiptap editor
                const { marked } = await import('marked');

                marked.setOptions({
                    breaks: true,
                    gfm: true,
                });

                const htmlContent = await marked.parse(data.content);
                console.log("Converted HTML:", htmlContent);

                // Set HTML content in editor (not markdown mode)
                setContent(htmlContent);
                setIsMarkdownMode(false);  // Stay in editor mode

                toast.success("AI 제안서가 생성되었습니다!");
            } else {
                toast.error("제안서 생성에 실패했습니다.");
            }
        } catch (e) {
            console.error("Generation error", e);
            toast.error("생성 중 오류가 발생했습니다.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">문서 로딩 중...</p>
                </div>
            </div>
        );
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
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">실시간 협업 중</span>
                    </div>
                    {isMarkdownMode && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMarkdownMode(false)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            편집 모드
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateProposal}
                        disabled={generating}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generating ? "생성 중..." : "AI 제안서 생성"}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </div>

            {/* Editor/Viewer Area */}
            <div className="flex-1 overflow-hidden p-8">
                <div className="max-w-5xl mx-auto h-full flex flex-col">
                    {isMarkdownMode ? (
                        <MarkdownViewer content={markdownContent} />
                    ) : (
                        <CollaborativeEditor
                            documentId={id}
                            userName={user.name}
                            initialContent={content}
                            onContentChange={setContent}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
