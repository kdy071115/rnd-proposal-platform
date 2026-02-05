"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Bell, Shield, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [rdAlerts, setRdAlerts] = useState(true);

    const [profileForm, setProfileForm] = useState({
        full_name: "",
        email: "",
    });

    const [companyForm, setCompanyForm] = useState({
        name: "",
        business_id: "",
        sector: "",
        address: "",
        founded_date: "",
        ceo: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch User info
            const userRes = await fetch("/api/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                setProfileForm({
                    full_name: userData.full_name,
                    email: userData.email
                });
            }

            // Fetch Company info
            const companyRes = await fetch("/api/companies/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (companyRes.ok) {
                const companyData = await companyRes.json();
                setCompanyForm({
                    name: companyData.name,
                    business_id: companyData.business_id || "",
                    sector: companyData.sector || "",
                    address: companyData.address || "",
                    founded_date: companyData.founded_date || "",
                    ceo: companyData.ceo || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = () => {
        toast.success("Profile updating is not implemented yet");
    };

    const handleSaveCompany = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/companies/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(companyForm)
            });

            if (res.ok) {
                toast.success("Company information updated successfully");
            } else {
                toast.error("Failed to update company info");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = () => {
        toast.info("Password change feature coming soon");
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account and company preferences
                </p>
            </div>

            {/* Account Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={profileForm.full_name}
                                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.email}
                                readOnly
                                className="bg-slate-50"
                            />
                        </div>
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company Information
                    </CardTitle>
                    <CardDescription>Manage your company details for R&D matching</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input
                                id="company-name"
                                value={companyForm.name}
                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="business-id">Business Registration Number</Label>
                            <Input
                                id="business-id"
                                placeholder="123-45-67890"
                                value={companyForm.business_id}
                                onChange={(e) => setCompanyForm({ ...companyForm, business_id: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sector">Industry Sector</Label>
                            <Input
                                id="sector"
                                placeholder="e.g. IT/Software"
                                value={companyForm.sector}
                                onChange={(e) => setCompanyForm({ ...companyForm, sector: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="founded_date">Founded Date</Label>
                            <Input
                                id="founded_date"
                                type="date"
                                value={companyForm.founded_date}
                                onChange={(e) => setCompanyForm({ ...companyForm, founded_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ceo">CEO Name</Label>
                        <Input
                            id="ceo"
                            value={companyForm.ceo}
                            onChange={(e) => setCompanyForm({ ...companyForm, ceo: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            placeholder="Full company address"
                            value={companyForm.address}
                            onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleSaveCompany} disabled={submitting} className="w-full sm:w-auto">
                        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Update Company Info
                    </Button>
                </CardContent>
            </Card>

            {/* Security & Notifications (Simplified for now) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications & Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive R&D matching alerts</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <Separator />
                    <Button variant="outline" onClick={handlePasswordChange}>Change Password</Button>
                </CardContent>
            </Card>
        </div>
    );
}
