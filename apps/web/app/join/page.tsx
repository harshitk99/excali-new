"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

export default function Join(){
    const createRoom = async (roomName:string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            
            const response = await axios.post("http://localhost:3001/room", 
                { slug: roomName },
                { 
                    headers: {
                        'Authorization': token
                    }
                }
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    const checkRoomExists = async (roomId: string) => {
        try {
            const response = await axios.get(`http://localhost:3001/room/${roomId}`);
            return response.data.roomId ? true : false;
        } catch (error) {
            console.error('Error checking room:', error);
            return false;
        }
    }
    
    const router=useRouter();
    const [roomId, setRoomId] = useState("");
    const [roomName, setRoomName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingRoom, setIsCheckingRoom] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);
    
    const handleJoin = async () => {
        if (!roomId.trim()) {
            setError("Please enter a room ID");
            return;
        }
        
        setError("");
        setIsCheckingRoom(true);
        
        try {
            const roomExists = await checkRoomExists(roomId);
            if (roomExists) {
                router.push(`/room/${roomId}`);
            } else {
                setError("Room not found. Please check the room ID and try again.");
            }
        } catch (error) {
            setError("Failed to check room. Please try again.");
        } finally {
            setIsCheckingRoom(false);
        }
    }
    
    const handleCreate = async () => {
        if (!roomName.trim()) {
            setError("Please enter a room name");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const result = await createRoom(roomName);
            router.push(`/room/${result.slug}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            setError("Failed to create room. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    
    return(
        <div className="container">
            <ThemeToggle />
            <div className="content">
                <div className="header">
                    <h1 className="title">Join or Create Drawing Room</h1>
                    <p className="subtitle">
                        Start creating art together in real-time. Join an existing drawing room or create your own to begin collaborating.
                    </p>
                </div>
                
                {/* Join Room Section */}
                <div className="section">
                    <h2 className="section-title">Join Drawing Room</h2>
                    <p className="section-description">Enter a room ID to join an existing collaborative drawing session</p>
                    
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Enter Room ID" 
                            value={roomId} 
                            onChange={(e) => setRoomId(e.target.value)}
                            className="input"
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        />
                    </div>
                    
                    <button 
                        onClick={handleJoin}
                        disabled={isCheckingRoom}
                        className="btn btn-primary"
                    >
                        <div className="btn-content">
                            {isCheckingRoom && <div className="spinner"></div>}
                            {isCheckingRoom ? "Checking Room..." : "Join Drawing Room"}
                        </div>
                    </button>
                </div>
                
                <div className="divider">
                    <span className="divider-text">or</span>
                </div>
                
                {/* Create Room Section */}
                <div className="section">
                    <h2 className="section-title">Create Drawing Room</h2>
                    <p className="section-description">Create a new drawing room and invite others to collaborate with you</p>
                    
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Enter Room Name" 
                            value={roomName} 
                            onChange={(e) => setRoomName(e.target.value)}
                            className="input"
                            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                    
                    <button 
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="btn btn-secondary"
                    >
                        <div className="btn-content">
                            {isLoading && <div className="spinner"></div>}
                            {isLoading ? "Creating Room..." : "Create Drawing Room"}
                        </div>
                    </button>
                </div>
                
                {error && (
                    <div className="alert error">
                        <div className="alert-icon error-icon">!</div>
                        <p className="alert-message error-message">{error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
