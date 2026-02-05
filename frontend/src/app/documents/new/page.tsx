"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/editor";
import { toast } from "sonner";
import { ArrowLeft, Save, FileText, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { CompanyData } from "@/lib/mock-data";

export default function NewDocumentPage() {
    const [title, setTitle] = useState("2024년도 R&D 과제 사업계획서_초안");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState<CompanyData | null>(null);

    // Fetch company data to populate template
    useEffect(() => {
        // In a real app, we would get the ID from params or context. Hardcoded for demo.
        const fetchCompany = async () => {
            try {
                const res = await fetch("/api/companies/123-45-67890");
                if (res.ok) {
                    const data = await res.json();
                    setCompany(data);
                    // generateTemplate(data); // Removed auto-generation on load to let user choose
                }
            } catch (e) {
                console.error("Failed to fetch company data", e);
            }
        };
        fetchCompany();
    }, []);

    const [generating, setGenerating] = useState(false);

    const handleAIGenerate = async () => {
        if (!company) return;
        setGenerating(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company_id: company.id })
            });

            if (res.ok) {
                const data = await res.json();
                setContent(data.content);
                toast.success("AI Proposal Generated!");
            } else {
                toast.error("Failed to generate proposal.");
            }
        } catch (e) {
            console.error("AI Generation failed", e);
            toast.error("AI Service Unavailable.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!company) return;
        setLoading(true);

        try {
            // Save Document to Backend with Auth
            const token = localStorage.getItem("token");
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    company_id: "123-45-67890", // Backend will override this with user's company
                }),
            });

            if (res.ok) {
                toast.success("Document saved successfully!");
            } else {
                toast.error("Failed to save document.");
            }
        } catch (e) {
            console.error("Save error", e);
            toast.error("Error saving document.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
                <div className="flex items-center gap-4">
                    <Link href="/">
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
                    <span className="text-sm text-muted-foreground mr-2">
                        Last autosaved: 2 mins ago
                    </span>
                    <Button variant="outline" onClick={handleAIGenerate} disabled={generating || !company} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                        {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 fill-indigo-200" />}
                        {generating ? "AI Thinking..." : "AI Auto-Generate"}
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save Document"}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto min-h-[800px]">
                    {/* Key prop removed to prevent re-mounting on every keystroke. Editor should handle content updates via useEffect if needed. */}
                    <TiptapEditor content={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}
