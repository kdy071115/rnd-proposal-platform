"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { ArrowLeft, TrendingUp, TrendingDown, Building2, FileText, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AnalysisPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [companyData, setCompanyData] = useState<any>(null);
    const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [financialForm, setFinancialForm] = useState({
        year: new Date().getFullYear(),
        revenue: 0,
        operating_profit: 0,
        debt_ratio: 0,
        net_profit: 0,
        total_assets: 0
    });

    const [projectForm, setProjectForm] = useState({
        title: "",
        year: new Date().getFullYear(),
        agency: "",
        amount: 0,
        result: "성공"
    });

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/companies/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setCompanyData(data);
            }
        } catch (error) {
            console.error("Failed to fetch company data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFinancial = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/companies/me/financials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(financialForm)
            });

            if (res.ok) {
                toast.success("Financial data added successfully");
                setIsFinancialModalOpen(false);
                fetchCompanyData();
            } else {
                toast.error("Failed to add financial data");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/companies/me/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(projectForm)
            });

            if (res.ok) {
                toast.success("Project history added successfully");
                setIsProjectModalOpen(false);
                fetchCompanyData();
            } else {
                toast.error("Failed to add project history");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (!companyData) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">No company data found</p>
                    <Link href="/">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Detailed Analysis</h2>
                    </div>
                    <p className="text-muted-foreground">
                        In-depth analysis and data management for {companyData.name}
                    </p>
                </div>
            </div>

            {/* Company Overview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Company Overview
                        </CardTitle>
                        <CardDescription>Basic information and registration details</CardDescription>
                    </div>
                    <Link href="/settings">
                        <Button variant="outline" size="sm">Edit Info</Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Company Name</p>
                            <p className="font-semibold mt-1">{companyData.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Business ID</p>
                            <p className="font-semibold mt-1">{companyData.business_id || "Not registered"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sector</p>
                            <p className="font-semibold mt-1">{companyData.sector}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Founded</p>
                            <p className="font-semibold mt-1">{companyData.founded_date}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Financial Analysis */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Financial Health</CardTitle>
                            <CardDescription>Revenue and debt ratio trends</CardDescription>
                        </div>
                        <Dialog open={isFinancialModalOpen} onOpenChange={setIsFinancialModalOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleAddFinancial}>
                                    <DialogHeader>
                                        <DialogTitle>Add Financial Data</DialogTitle>
                                        <DialogDescription>Enter financial indicators for a specific year.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="year" className="text-right">Year</Label>
                                            <Input
                                                id="year"
                                                type="number"
                                                className="col-span-3"
                                                value={financialForm.year}
                                                onChange={(e) => setFinancialForm({ ...financialForm, year: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="revenue" className="text-right">Revenue (억)</Label>
                                            <Input
                                                id="revenue"
                                                type="number"
                                                step="0.1"
                                                className="col-span-3"
                                                onChange={(e) => setFinancialForm({ ...financialForm, revenue: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="debt" className="text-right">Debt Ratio (%)</Label>
                                            <Input
                                                id="debt"
                                                type="number"
                                                step="0.1"
                                                className="col-span-3"
                                                onChange={(e) => setFinancialForm({ ...financialForm, debt_ratio: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Data
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {companyData.financials && companyData.financials.length > 0 ? (
                            <div className="space-y-4">
                                {companyData.financials.sort((a: any, b: any) => b.year - a.year).map((fin: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Year {fin.year}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Revenue: {fin.revenue}억원 • Debt Ratio: {fin.debt_ratio}%
                                            </p>
                                        </div>
                                        {fin.debt_ratio < 100 ? (
                                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-amber-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">No financial data registered</p>
                                <Button variant="link" size="sm" onClick={() => setIsFinancialModalOpen(true)}>Add your first data</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Technology Assets</CardTitle>
                        <CardDescription>Patents and intellectual property</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Patents</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {companyData.patents?.registered || 0}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Registered patents in technology field
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Pending</span>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {companyData.patents?.pending || 0}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Applications under review
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project History */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Government R&D Project History
                        </CardTitle>
                        <CardDescription>Past projects and success rate</CardDescription>
                    </div>
                    <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleAddProject}>
                                <DialogHeader>
                                    <DialogTitle>Add Project History</DialogTitle>
                                    <DialogDescription>Record your past R&D project details.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Project Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. 중소기업 기술혁신개발사업"
                                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="year">Year</Label>
                                            <Input
                                                id="year"
                                                type="number"
                                                value={projectForm.year}
                                                onChange={(e) => setProjectForm({ ...projectForm, year: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount (억)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.1"
                                                onChange={(e) => setProjectForm({ ...projectForm, amount: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="agency">Agency</Label>
                                        <Input
                                            id="agency"
                                            placeholder="e.g. 중소벤처기업부"
                                            onChange={(e) => setProjectForm({ ...projectForm, agency: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Project
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {companyData.projects && companyData.projects.length > 0 ? (
                        <div className="space-y-3">
                            {companyData.projects.map((project: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{project.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {project.year} • {project.agency} • {project.amount}억원
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${project.result === "성공"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-700"
                                        }`}>
                                        {project.result}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                            <p className="text-sm text-muted-foreground mb-2">No project history available</p>
                            <Button variant="outline" size="sm" onClick={() => setIsProjectModalOpen(true)}>Add your first project</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
