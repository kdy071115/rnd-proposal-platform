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
    const [cursors, setCursors] = useState<{ [key: string]: { x: number, y: number, user: any } }>({});
    const lastCursorUpdate = useMemo(() => ({ current: 0 }), []);

    // Generate deterministic color from string
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    // Use provided color or generate deterministic one
    const userColor = useMemo(() =>
        providedColor || stringToColor(userName || "Anonymous"),
        [providedColor, userName]
    );

    // Update content when initialContent changes
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        // WebSocket 연결
        const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = typeof window !== 'undefined' ? `${wsProtocol}//${window.location.host}` : 'ws://localhost:8000';
        // Note: Using relative path from API proxy or direct backend URL if configured
        // Assuming Next.js proxy forwards /api/ws to backend
        const wsUrl = `/api/ws/docs/${documentId}?user_email=${encodeURIComponent(userName)}`;
        // If proxy is not set up for WS, fall back to direct backend port (usually 8000 for FastAPI)
        // ideally we should use an env var, but for now let's try relative path assuming rewriter, 
        // or absolute path to backend. Given previous context, let's use the explicit backend port approach if relative fails?
        // Actually, let's try to construct it based on window location but port 8000 for dev validity 
        // previous code used: typeof window !== 'undefined' ? `${wsProtocol}//${window.location.hostname}:8000` : ...
        // Let's stick to the previous pattern which seemed to work for connection
        const backendHost = typeof window !== 'undefined' ? `${wsProtocol}//${window.location.hostname}:8000` : 'ws://localhost:8000';
        const fullWsUrl = `${backendHost}/ws/docs/${documentId}?user_email=${encodeURIComponent(userName)}`;

        const websocket = new WebSocket(fullWsUrl);

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
                        // 새로운 유저가 들어옴 -> 내 목록에 추가
                        if (message.user && message.user.name) {
                            setActiveUsers(prev => {
                                // 중복 방지
                                if (prev.some(u => u.name === message.user.name)) return prev;
                                // 나 자신은 추가하지 않음 (따로 렌더링)
                                if (message.user.name === userName) return prev;
                                return [...prev, message.user];
                            });

                            // **중요**: 새로 들어온 유저에게 "나도 여기 있어"라고 알려줌 (Sync)
                            if (message.user.name !== userName) {
                                websocket.send(JSON.stringify({
                                    type: "presence",
                                    action: "sync",
                                    user: { name: userName, color: userColor }
                                }));
                            }
                        }
                    } else if (message.action === "leave") {
                        setActiveUsers(prev => prev.filter(u => u.name !== message.user?.name));
                        // Remove cursor
                        setCursors(prev => {
                            const newCursors = { ...prev };
                            delete newCursors[message.user?.name];
                            return newCursors;
                        });
                    } else if (message.action === "sync") {
                        // 기존 유저가 자신의 존재를 알림 -> 내 목록에 추가
                        if (message.user && message.user.name) {
                            setActiveUsers(prev => {
                                if (prev.some(u => u.name === message.user.name)) return prev;
                                if (message.user.name === userName) return prev;
                                return [...prev, message.user];
                            });
                        }
                    }
                } else if (message.type === "content") {
                    // 다른 사용자의 편집 내용 반영
                    if (message.user?.name !== userName) {
                        setContent(message.content);
                        if (onContentChange) {
                            onContentChange(message.content);
                        }
                    }
                } else if (message.type === "cursor") {
                    // Update cursor position
                    if (message.user && message.user.name && message.user.name !== userName) {
                        setCursors(prev => ({
                            ...prev,
                            [message.user.name]: {
                                x: message.x,
                                y: message.y,
                                user: message.user
                            }
                        }));
                    }
                }
            } catch (e) {
                console.error("Failed to parse message", e);
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            // Reconnection logic could go here
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [documentId, userName, userColor]); // onContentChange 제거 (무한 루프 방지)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const now = Date.now();
        if (now - lastCursorUpdate.current < 50) return; // Throttle to 20fps
        lastCursorUpdate.current = now;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100; // Percentage
        const y = (e.clientY - rect.top) / rect.height * 100; // Percentage

        ws.send(JSON.stringify({
            type: "cursor",
            x,
            y,
            user: { name: userName, color: userColor }
        }));
    };

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
                        {/* Me (Always First) */}
                        <Avatar className="w-8 h-8 border-2 border-white z-10" style={{ boxShadow: `0 0 0 2px ${userColor}` }}>
                            <AvatarFallback style={{ backgroundColor: userColor }} className="text-[10px] text-white font-semibold">
                                {userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Others */}
                        {activeUsers.map((user, i) => (
                            <Avatar key={i} className="w-8 h-8 border-2 border-white transition-transform hover:scale-110" style={{ boxShadow: `0 0 0 2px ${user?.color || '#ccc'}` }}>
                                <AvatarFallback style={{ backgroundColor: user?.color || '#ccc' }} className="text-[10px] text-white font-semibold">
                                    {(user?.name || "?").substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
                <div className="text-sm font-medium text-indigo-700">
                    {activeUsers.length > 0 ? `${activeUsers.length + 1}명 협업 중` : "나 혼자 작업 중"}
                </div>
            </div>

            {/* Editor Area with Cursor Tracking */}
            <div className="relative flex-1 min-h-0" onMouseMove={handleMouseMove} onMouseLeave={() => {
                // Optional: Send "cursor leave" message
            }}>
                <Card className="h-full p-6 overflow-y-auto shadow-inner bg-white relative">
                    <TiptapEditor content={content} onChange={handleContentChange} />

                    {/* Render Remote Cursors */}
                    {Object.values(cursors).map((cursor) => (
                        <div
                            key={cursor.user.name}
                            className="absolute pointer-events-none transition-all duration-100 ease-linear z-50"
                            style={{
                                left: `${cursor.x}%`,
                                top: `${cursor.y}%`,
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="drop-shadow-sm"
                            >
                                <path
                                    d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L11.7841 12.3673H5.65376Z"
                                    fill={cursor.user.color}
                                    stroke="white"
                                />
                            </svg>
                            <div
                                className="absolute left-3 top-3 px-2 py-1 rounded-full text-[10px] text-white font-bold whitespace-nowrap shadow-md"
                                style={{ backgroundColor: cursor.user.color }}
                            >
                                {cursor.user.name}
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
}
