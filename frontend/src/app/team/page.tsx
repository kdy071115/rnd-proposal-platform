"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Mail, UserPlus, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");
    const [inviting, setInviting] = useState(false);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/team", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (e) {
            console.error("Failed to fetch team members", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setInviting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/team/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: "User", // This will be overridden by the backend with actual user name
                    email: inviteEmail,
                    role: inviteRole
                })
            });

            if (res.ok) {
                toast.success(`초대 이메일이 발송되었습니다!`, {
                    description: `${inviteEmail}로 초대 링크가 전송되었습니다.`
                });
                setInviteEmail("");
                fetchMembers(); // Refresh list
            } else {
                const error = await res.json();
                toast.error(error.detail || "초대 전송에 실패했습니다.");
            }
        } catch (e) {
            console.error(e);
            toast.error("오류가 발생했습니다.");
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
                <p className="text-muted-foreground">기존 가입자를 팀으로 초대하여 함께 협업하세요.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Invite Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            초대하기
                        </CardTitle>
                        <CardDescription>이미 가입된 사용자의 이메일을 입력하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">이메일 주소</label>
                            <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">역할 (Role)</label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Member">Member</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" onClick={handleInvite} disabled={inviting || !inviteEmail}>
                            {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                            {inviting ? "보내는 중..." : "초대장 발송"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Member List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage your existing team members and their roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No members found. Invite someone!</div>
                        ) : (
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>{member.role}</Badge>
                                            <Badge variant="outline" className={member.status === 'Pending' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 'text-green-600 border-green-200 bg-green-50'}>
                                                {member.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
