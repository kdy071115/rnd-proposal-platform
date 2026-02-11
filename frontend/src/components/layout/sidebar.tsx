"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
    LogOut
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Analysis", href: "/analysis", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Team", href: "/team", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Simple client-side auth check
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, [pathname]);

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem("token");

        // Clear cookie for middleware
        // This is crucial to prevent middleware from immediately redirecting back to home if user tries to login again
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        setIsLoggedIn(false);
        router.push("/login");
        router.refresh(); // Refresh to insure middleware sees the cleared cookie
    };

    if (pathname === "/login" || pathname === "/signup") {
        return null;
    }

    return (
        <div className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300">
            <div className="flex h-16 items-center px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        R
                    </span>
                    <span>InSight R&D</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-4">
                    {navigation.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : ""
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                {isLoggedIn ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-indigo-500">U</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">User Corp</span>
                                <span className="text-[10px] text-muted-foreground">Standard Plan</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-3 h-3 mr-2" />
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link href="/login" className="w-full block">
                            <Button className="w-full" variant="outline" size="sm">Login</Button>
                        </Link>
                        <Link href="/signup" className="w-full block">
                            <Button className="w-full" size="sm">Sign Up</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
