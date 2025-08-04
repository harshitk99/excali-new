"use client";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import ThemeToggle from "./ThemeToggle";

interface Message {
    message: string;
    timestamp: string;
    userId: string;
    userName: string;
    id: string;
}

interface ChatRoomClientProps {
    messages: Message[];
    id: number;
}

export function ChatRoomClient({ messages: initialMessages, id }: ChatRoomClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [currentMessage, setCurrentMessage] = useState("");
    const [userName, setUserName] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket, loading } = useSocket();

    useEffect(() => {
        const storedName = localStorage.getItem("userName") || "";
        setUserName(storedName);
        console.log("ChatRoomClient: userName set to", storedName);
    }, []);

    useEffect(() => {
        console.log("ChatRoomClient: socket state changed", { socket: !!socket, loading, isConnected });
        
        if (socket && !loading) {
            console.log("ChatRoomClient: Attempting to join room", id);
            
            // Join the room
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            // Set up message handler
            const handleMessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("ChatRoomClient: Received message", data);
                    
                    if (data.type === "chat") {
                        const newMessage: Message = {
                            message: data.message,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            userId: data.userId,
                            userName: data.userName || "Anonymous",
                            id: Date.now().toString()
                        };
                        setMessages(prev => [...prev, newMessage]);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            // Set up connection status handlers
            const handleOpen = () => {
                console.log("WebSocket connected");
                setIsConnected(true);
            };

            const handleError = (error: Event) => {
                console.error("WebSocket error:", error);
                setIsConnected(false);
            };

            const handleClose = () => {
                console.log("WebSocket disconnected");
                setIsConnected(false);
            };

            // Add event listeners
            socket.addEventListener('open', handleOpen);
            socket.addEventListener('message', handleMessage);
            socket.addEventListener('error', handleError);
            socket.addEventListener('close', handleClose);

            // Cleanup function
            return () => {
                socket.removeEventListener('open', handleOpen);
                socket.removeEventListener('message', handleMessage);
                socket.removeEventListener('error', handleError);
                socket.removeEventListener('close', handleClose);
            };
        }
    }, [socket, loading, id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        console.log("sendMessage called", {
            currentMessage: currentMessage.trim(),
            socket: !!socket,
            loading,
            isConnected
        });
        
        if (currentMessage.trim() && socket && socket.readyState === WebSocket.OPEN) {
            const messageData = {
                type: "chat",
                roomId: id,
                message: currentMessage,
                userName: userName || "You"
            };
            
            console.log("Sending message:", messageData);
            socket.send(JSON.stringify(messageData));
            setCurrentMessage("");
        } else {
            console.log("Cannot send message:", {
                hasMessage: !!currentMessage.trim(),
                hasSocket: !!socket,
                socketReadyState: socket?.readyState,
                isConnected
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isOwnMessage = (msgUserName: string | undefined) => {
        const isOwn = msgUserName && userName && msgUserName === userName;
        console.log("isOwnMessage check:", { msgUserName, userName, isOwn });
        return isOwn;
    };

    return (
        <div className="chat-container">
            <ThemeToggle />
            
            <div className="chat-header">
                <h1 className="chat-title">Room #{id}</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        {isConnected ? "Connected" : "Connecting..."}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((message, index) => {
                    const ownMessage = isOwnMessage(message.userName);
                    console.log(`Message ${index}:`, { 
                        message: message.message, 
                        userName: message.userName, 
                        currentUserName: userName, 
                        isOwn: ownMessage 
                    });
                    
                    return (
                        <div
                            key={message.id || index}
                            className={`message-wrapper ${ownMessage ? 'message-own-wrapper' : 'message-other-wrapper'}`}
                        >
                            <div className={`message ${ownMessage ? 'message-own' : 'message-other'}`}>
                                <div className="message-header">
                                    <span className="message-username">
                                        {ownMessage ? 'You' : message.userName}
                                    </span>
                                    <span className="message-time">{message.timestamp}</span>
                                </div>
                                <div className="message-content">
                                    {message.message}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <form 
                    className="chat-input-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                >
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="chat-input"
                        disabled={!socket || socket.readyState !== WebSocket.OPEN}
                    />
                    <button
                        type="submit"
                        disabled={!currentMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN}
                        className="chat-send-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
