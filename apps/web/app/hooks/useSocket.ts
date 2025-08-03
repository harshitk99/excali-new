import { useEffect, useState } from "react"

export function useSocket(){
    const WS_URL="ws://localhost:8080";
    const [loading,setLoading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();

    useEffect(()=>{
        const ws=new WebSocket(WS_URL);
        //@ts-ignore
        ws.onopen(()=>{
            setLoading(false);
            setSocket(ws);
        })
    },[]);

    return{
        socket,
        loading
    }
}