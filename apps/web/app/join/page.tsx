"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Join(){
    const router=useRouter();
    const [roomId, setRoomId] = useState("");
    const handleJoin = () => {
        console.log(roomId);
        router.push(`/room/${roomId}`);
    }
    return(
        <div>
            <h1>Join Room</h1>
            <input type="text" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
            <button onClick={handleJoin}>Join</button>
        </div>
    )
}