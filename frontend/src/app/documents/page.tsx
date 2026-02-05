"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Document {
    id: number;
    title: string;
    created_at: string;
    company_id: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await fetch("/api/documents?company_id=123-45-67890");
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data);
                }
            } catch (e) {
                console.error("Failed to fetch documents", e);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                    <p className="text-muted-foreground">Manage your R&D proposals and reports.</p>
                </div>
                <Link href="/documents/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Document
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm">Start by creating a new proposal draft.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-start gap-2">
                                    <FileText className="w-5 h-5 mt-0.5 text-primary" />
                                    {doc.title}
                                </CardTitle>
                                <CardDescription>
                                    Created on {doc.created_at ? format(new Date(doc.created_at), "PPP") : "Unknown"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end">
                                    <Link href={`/documents/${doc.id}`}>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
