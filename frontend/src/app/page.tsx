"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, CheckCircle2, AlertCircle, Building2, Wallet, Lightbulb, Loader2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CompanyData } from "@/lib/mock-data";
import { toast } from "sonner";

export default function Dashboard() {
  const [bizId, setBizId] = useState("123-45-67890");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompanyData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/companies/${bizId}`;
      let headers = {};

      if (token) {
        url = `/api/companies/me`;
        headers = { "Authorization": `Bearer ${token}` };
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        // Fallback or error handling
        if (token) {
          console.log("Failed to fetch my company, trying bizId...");
          // You might want to unset token or handle specific 404
        }
        throw new Error("Company not found");
      }

      const jsonData = await res.json();
      // Map API response to UI data structure if needed, or update CompanyData type
      // For now, assuming detailed scoring/analysis logic will be moved to backend
      const mappedData: CompanyData = {
        ...jsonData,
        status: 'stable',
        score: jsonData.score || { total: 0, grade: 'B', breakdown: { financial: 0, technology: 0, experience: 0 } },
        patents: jsonData.patents || { registered: 0, pending: 0, grade: 'B' },
        financials: jsonData.financials || [],
        history: jsonData.projects || []
      };

      setData(mappedData);
      toast.success("Analysis complete");
    } catch (error) {
      // toast.error("Failed to fetch data."); 
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /* Recommendation State */
  const [recommendations, setRecommendations] = useState<any[]>([]);

  /* Fetch Recommendations */
  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/recommendations", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (e) {
      console.error("Failed to fetch recommendations", e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRecommendations(); // Load recommendations
  }, []); // Initial load

  /* Handle Apply button - Create AI-generated document for R&D notice */
  const handleApply = async (rec: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      toast.info("AI가 제안서를 작성하고 있습니다...", { duration: 3000 });

      // Call AI generation API
      const generateRes = await fetch("/api/generate/rd-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rd_notice_id: rec.id
        })
      });

      if (!generateRes.ok) {
        toast.error("Failed to generate proposal");
        return;
      }

      const { content } = await generateRes.json();

      // Convert markdown to HTML for Tiptap editor
      const { marked } = await import('marked');

      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      const htmlContent = await marked.parse(content);
      console.log("Apply - Converted markdown to HTML");

      // Create document with AI-generated HTML content
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `제안서: ${rec.title}`,
          content: htmlContent  // Save as HTML instead of markdown
        })
      });

      if (res.ok) {
        const newDoc = await res.json();
        toast.success(`AI 제안서 작성 완료: ${rec.title}`);
        // Redirect to the new document
        window.location.href = `/documents/${newDoc.id}`;
      } else {
        toast.error("Failed to create document");
      }
    } catch (error) {
      console.error("Failed to create document", error);
      toast.error("Failed to create document");
    }
  };

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="flex gap-2 w-full max-w-md">
          <Input
            placeholder="Enter Business ID (e.g., 123-45-67890)"
            value={bizId}
            onChange={(e) => setBizId(e.target.value)}
          />
          <Button onClick={fetchData}>Analyze</Button>
        </div>
        <p className="text-muted-foreground">Please enter a business registration number to start analysis.</p>
        <div className="text-xs text-muted-foreground mt-4">
          Test Tip: Try logging in first to see personalized R&D matches!
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {loading ? "Analyzing corporate data..." : `Analysis Result for ${data?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Input
              className="w-40 h-9 bg-background"
              value={bizId}
              onChange={(e) => setBizId(e.target.value)}
            />
            <Button size="sm" variant="secondary" onClick={fetchData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <Link href="/documents/new">
            <Button variant="outline">Draft Proposal</Button>
          </Link>
          <Button onClick={fetchData} disabled={loading}>New Analysis</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Gathering financial data from NTS...</p>
          </div>
        </div>
      ) : (
        /* Main Analysis Section */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Score Card (Span 3) */}
          <Card className="col-span-3 bg-gradient-to-br from-card to-secondary/50 border-input">
            <CardHeader>
              <CardTitle>Corporate Suitability Score</CardTitle>
              <CardDescription>Based on Financial, Tech, and History data</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center w-48 h-48 rounded-full border-8 border-muted mt-2 mb-6">
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 text-primary drop-shadow-lg" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * (data?.score?.total || 0)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="flex flex-col items-center text-center z-10">
                  <span className="text-5xl font-bold tracking-tighter text-foreground">{data?.score?.total || 0}</span>
                  <span className="text-sm font-semibold text-muted-foreground mt-1">Grade {data?.score?.grade || '-'}</span>
                </div>
              </div>

              <div className="flex w-full items-center justify-between px-8 text-sm">
                <div className="flex flex-col items-center text-emerald-500">
                  <CheckCircle2 className="w-5 h-5 mb-1" />
                  <span>Eligible</span>
                </div>
                <div className="h-8 w-[1px] bg-border" />
                <div className="flex flex-col items-center text-muted-foreground">
                  <span className="font-medium">Potential</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Cards & History (Span 4) */}
          <div className="col-span-4 grid gap-6 grid-rows-2">

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Financial</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{data?.status === 'stable' ? 'Stable' : 'Check'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue <span className="text-emerald-500 font-medium flex inline-flex items-center">
                      {((data?.financials?.[0]?.revenue || 0) / 1000).toFixed(1)}B <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </p>
                  <Progress value={(data?.score?.breakdown?.financial || 0) * 3.3} className="h-1.5 mt-3 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tech IP</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.patents?.registered || 0} Patents</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pending: {data?.patents?.pending || 0}
                  </p>
                  <Progress value={(data?.score?.breakdown?.technology || 0) * 2.5} className="h-1.5 mt-3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.history?.length || 0} Projects</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gov. R&D History
                  </p>
                  <Progress value={(data?.score?.breakdown?.experience || 0) * 3.3} className="h-1.5 mt-3 bg-amber-100" indicatorClassName="bg-amber-500" />
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-100" />
                      AI Customized R&D Matches
                    </CardTitle>
                    <CardDescription>Top funding opportunities matching your profile</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[220px] overflow-y-auto">
                  {recommendations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      {localStorage.getItem("token") ? "No matches found yet." : "Please login to see personalized matches."}
                    </div>
                  ) : (
                    recommendations.map((rec: any) => (
                      <div key={rec.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{rec.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium whitespace-nowrap">
                              {rec.match_score}% Match
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{rec.department}</span>
                            <span>•</span>
                            <span>Up to {rec.grant_amount}M KRW</span>
                            <span>•</span>
                            <span className="text-indigo-600">{rec.match_reason}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() => handleApply(rec)}
                        >
                          Apply
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
