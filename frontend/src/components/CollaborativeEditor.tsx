"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TiptapEditor from "@/components/editor";
import { Users } from "lucide-react";

interface CollaborativeEditorProps {
    documentId: string;
    userName: string;
    userColor?: string;
    initialContent?: string;
    onContentChange?: (content: string) => void;
}

export default function CollaborativeEditor({
    documentId,
    userName,
    userColor: providedColor,
    initialContent = "",
    onContentChange
}: CollaborativeEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    // Memoize color to prevent infinite loop
    const userColor = useMemo(() =>
        providedColor || "#" + Math.floor(Math.random() * 16777215).toString(16),
        [providedColor]
    );

    // Update content when initialContent changes
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        // WebSocket 연결
        const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = typeof window !== 'undefined' ? `${wsProtocol}//${window.location.hostname}:8000` : 'ws://localhost:8000';
        const wsUrl = `${wsHost}/ws/docs/${documentId}?user_email=${encodeURIComponent(userName)}`;

        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log("WebSocket connected");
            // 접속 알림
            websocket.send(JSON.stringify({
                type: "presence",
                action: "join",
                user: { name: userName, color: userColor }
            }));
        };

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === "presence") {
                    if (message.action === "join") {
                        setActiveUsers(prev => [...prev, message.user]);
                    } else if (message.action === "leave") {
                        setActiveUsers(prev => prev.filter(u => u.name !== message.user?.name));
                    }
                } else if (message.type === "content") {
                    // 다른 사용자의 편집 내용 반영
                    setContent(message.content);
                    if (onContentChange) {
                        onContentChange(message.content);
                    }
                }
            } catch (e) {
                console.error("Failed to parse message", e);
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        websocket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [documentId, userName, userColor, onContentChange]);

    const handleContentChange = (newContent: string) => {
        setContent(newContent);

        // 부모 컴포넌트에 변경 알림 (저장 기능용)
        if (onContentChange) {
            onContentChange(newContent);
        }

        // 변경 내용을 다른 사용자에게 브로드캐스트
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "content",
                content: newContent,
                user: { name: userName, color: userColor }
            }));
        }
    };

    return (
        <div className="relative flex flex-col w-full h-full space-y-4">
            {/* Presence Header */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <div className="flex -space-x-2">
                        <Avatar className="w-8 h-8 border-2 border-white" style={{ boxShadow: `0 0 0 2px ${userColor}` }}>
                            <AvatarFallback style={{ backgroundColor: userColor }} className="text-[10px] text-white font-semibold">
                                {userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {activeUsers.map((user, i) => (
                            <Avatar key={i} className="w-8 h-8 border-2 border-white" style={{ boxShadow: `0 0 0 2px ${user.color}` }}>
                                <AvatarFallback style={{ backgroundColor: user.color }} className="text-[10px] text-white font-semibold">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
                <div className="text-sm font-medium text-indigo-700">
                    {activeUsers.length + 1}명 협업 중
                </div>
            </div>

            {/* Editor Area */}
            <Card className="flex-1 p-6 overflow-y-auto min-h-[500px] shadow-inner bg-white">
                <TiptapEditor content={content} onChange={handleContentChange} />
            </Card>
        </div>
    );
}
