import { useEffect, useState } from "react"

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(()=>{
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No JWT token found. Please login first.');
            setLoading(false);
            return;
        }

        console.log('useSocket: Creating WebSocket connection with token');
        const WS_URL = `ws://localhost:8080?token=${token}`;
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('useSocket: WebSocket connected successfully');
            setLoading(false);
            setSocket(ws);
        };

        ws.onerror = (error) => {
            console.error('useSocket: WebSocket connection error:', error);
            setLoading(false);
        };

        ws.onclose = (event) => {
            console.log('useSocket: WebSocket connection closed:', event.code, event.reason);
            setSocket(undefined);
        };

        // (Optional) Cleanup the socket connection on unmount
        return () => {
            console.log('useSocket: Cleaning up WebSocket connection');
            ws.close();
        };
    },[]);

    const logout = () => {
        localStorage.removeItem('token');
        if (socket) {
            socket.close();
        }
        setSocket(undefined);
        setLoading(true);
    };

    return{
        socket,
        loading,
        logout
    }
}
