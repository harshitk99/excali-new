import axios from "axios";
import ChatRoom from "../../components/ChatRoom";
import { redirect } from "next/navigation";

async function getRoomId(slug:string){
    const repsonse=await axios.get(`http://localhost:3001/room/${slug}`)
    console.log(repsonse.data)
    console.log(repsonse.data.roomId)
    return repsonse.data.roomId
}

export default async function Room({params}:{params:{slug:string}}){
    const slug=(await params).slug
    const roomId=await getRoomId(slug)
    
    return(
        <ChatRoom id={roomId}></ChatRoom>
    )
}