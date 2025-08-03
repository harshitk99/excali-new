import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(id: number) {
    try {
        const response = await fetch(`http://localhost:3001/chats/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chats: ${response.status}`);
        }
        const data = await response.json();
        // The API returns { chats: [...] }, so we need to extract the chats array
        return data.chats || [];
    } catch (error) {
        console.error("Error fetching chats:", error);
        return [];
    }
}

export default async function ChatRoom({ id }: { id: number }) {
    const messages = await getChats(id);
    
    return (
        <div className="h-full">
            <ChatRoomClient messages={messages} id={id} />
        </div>
    );
}