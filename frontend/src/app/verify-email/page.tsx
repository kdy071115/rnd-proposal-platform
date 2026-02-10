"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Invalid verification link");
            setVerifying(false);
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`);

                if (res.ok) {
                    setSuccess(true);
                    setTimeout(() => {
                        router.push("/login");
                    }, 3000);
                } else {
                    const data = await res.json();
                    setError(data.detail || "Verification failed");
                }
            } catch (e) {
                console.error(e);
                setError("An error occurred during verification");
            } finally {
                setVerifying(false);
            }
        };

        verifyEmail();
    }, [token, router]);

    if (verifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <div>
                                <CardTitle>이메일 인증 중...</CardTitle>
                                <CardDescription>잠시만 기다려주세요</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                            <div>
                                <CardTitle className="text-green-600">인증 완료!</CardTitle>
                                <CardDescription>이메일 인증이 성공적으로 완료되었습니다</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            이제 로그인하여 R&D SaaS Platform을 사용할 수 있습니다.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            3초 후 로그인 페이지로 이동합니다...
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => router.push("/login")}
                        >
                            지금 로그인하기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <XCircle className="w-12 h-12 text-red-600" />
                        <div>
                            <CardTitle className="text-red-600">인증 실패</CardTitle>
                            <CardDescription>이메일 인증에 실패했습니다</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {error || "인증 링크가 유효하지 않거나 만료되었습니다."}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push("/signup")}
                        >
                            다시 가입하기
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => router.push("/login")}
                        >
                            로그인
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
