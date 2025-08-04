import { ChatRoomClient } from "./ChatRoomClient";

interface Message {
    message: string;
    timestamp: string;
    userId: string;
    userName: string;
    id: string;
}

interface ChatRoomProps {
    id: number;
}

async function getChats(id: number) {
    try {
        const response = await fetch(`http://localhost:3001/chats/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chats: ${response.status}`);
        }
        const data = await response.json();
        console.log("Raw chat data from backend:", data);
        
        // Format the messages to match the expected structure
        const formattedMessages = (data.chats || []).map((chat: any) => {
            const message = {
                message: chat.message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                userId: chat.userId,
                userName: chat.user?.name || "Anonymous", // Use user.name from the relation
                id: chat.id.toString()
            };
            console.log("Formatted message:", message);
            return message;
        });
        
        console.log("All formatted messages:", formattedMessages);
        return formattedMessages;
    } catch (error) {
        console.error("Error fetching chats:", error);
        return [];
    }
}

export default async function ChatRoom({ id }: ChatRoomProps) {
    const messages = await getChats(id);
    
    return (
        <div className="chat-container">
            <ChatRoomClient messages={messages} id={id} />
        </div>
    );
}