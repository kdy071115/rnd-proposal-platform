"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Loader2, CheckCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

function AcceptInviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const authToken = localStorage.getItem("token");
        if (authToken) {
            setIsLoggedIn(true);
        } else if (token) {
            // Not logged in but has token, redirect to login with redirect back
            toast.info("초대를 수락하려면 먼저 로그인해야 합니다.");
            router.push(`/login?redirect=/accept-invite?token=${token}`);
        }
        setCheckingAuth(false);
    }, [token, router]);

    useEffect(() => {
        if (isLoggedIn && token && !accepting && !accepted) {
            handleAccept();
        }
    }, [isLoggedIn, token]);

    const handleAccept = async () => {
        if (!token) {
            toast.error("유효하지 않은 초대 링크입니다.");
            return;
        }

        setAccepting(true);
        try {
            const authToken = localStorage.getItem("token");
            const res = await fetch("/api/team/accept-invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    token: token
                })
            });

            if (res.ok) {
                setAccepted(true);
                toast.success("초대가 성공적으로 수락되었습니다!");
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            } else {
                const error = await res.json();
                toast.error(error.detail || "초대 수락에 실패했습니다.");
            }
        } catch (e) {
            console.error(e);
            toast.error("오류가 발생했습니다.");
        } finally {
            setAccepting(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">유효하지 않은 초대</CardTitle>
                        <CardDescription>초대 링크가 유효하지 않거나 만료되었습니다.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (accepted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <CardTitle className="text-green-600">초대 수락 완료!</CardTitle>
                                <CardDescription>대시보드로 이동합니다...</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <UserPlus className="w-8 h-8 text-primary" />
                        <div>
                            <CardTitle>팀 초대 수락</CardTitle>
                            <CardDescription>아래 버튼을 눌러 팀에 합류하세요</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isLoggedIn ? (
                        <Button className="w-full" onClick={() => router.push(`/login?redirect=/accept-invite?token=${token}`)}>
                            <LogIn className="w-4 h-4 mr-2" />
                            로그인하고 수락하기
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            onClick={handleAccept}
                            disabled={accepting}
                        >
                            {accepting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    처리 중...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    초대 수락하기
                                </>
                            )}
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                        현재 로그인된 계정으로 팀에 합류하게 됩니다.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    );
}

