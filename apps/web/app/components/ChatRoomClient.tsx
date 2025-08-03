"use client"

import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket";


export function ChatRoomClient({
    messages,
    id
}:{
    messages:{message:string}[],
    id:number
}){
    const [chats,setChats]=useState(Array.isArray(messages) ? messages : []);
    const [currentMessage,setCurrentMessage]=useState("");
    const {socket,loading}=useSocket();

    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type:"join_room",
                roomId:id
            }))

            socket.onmessage=(event)=>{
                const parsedData=JSON.parse(event.data);
                if(parsedData.type=="chat"){
                    setChats(c=>[...c,{message:parsedData.message}])
                }
            }
        }
    },[socket,loading,id])

    const sendMessage = () => {
        if (currentMessage.trim() && socket && !loading) {
            socket.send(JSON.stringify({
                type: "chat",
                roomId: id,
                message: currentMessage
            }));
            setCurrentMessage("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chats.map((chat, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm">{chat.message}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !currentMessage.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
} 