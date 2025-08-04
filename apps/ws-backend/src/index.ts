import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
const prisma=prismaClient;
const wss=new WebSocketServer({port:8080});

interface User{
    userId:String,
    rooms:String[],
    ws:WebSocket

}

const users:User[] =[]

function checkUser(token:string):string | null{
    if (!token || token.trim() === '') {
        return null;
    }
    
    try {
        const decoded=jwt.verify(token,JWT_SECRET as string)

        if(!decoded || !(decoded as JwtPayload).userId){
            return null;
        }
        
        return (decoded as JwtPayload).userId;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

wss.on('connection',function connection(ws,request){
    const url=request.url;
    if(!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split('?')[1]);
    const token=queryParams.get('token') || "";
    const userId=checkUser(token);
    if(userId==null){
        console.log('WebSocket connection rejected: Invalid or missing JWT token');
        ws.close(1008, 'Authentication failed: Invalid or missing JWT token');
        return;
    }
    users.push({
        userId,
        rooms:[],
        //@ts-ignore
        ws
    })

    
    ws.on('message',async function message(data){
        const parsedData=JSON.parse(data as unknown as string) // {type : "join-room",roomId:1}
        
        if(parsedData.type=="join_room"){
            //@ts-ignore
            const user=users.find(x=> x.ws==ws);
            const userRoom=await prisma.room.findMany({
                where:{
                    id:parsedData.roomId
                }
            })
            user?.rooms.push(parsedData.roomId);
        }


        if(parsedData.type=="leave_room"){
             //@ts-ignore
            const user=users.find(x=> x.ws==ws);
            if(!user){
                return;
            }
            user.rooms=user?.rooms.filter(x => x ===parsedData.room)
        }
        
        
        
        if(parsedData.type=="chat"){
            const roomId=parsedData.roomId;
            const message=parsedData.message;
            const userName=parsedData.userName || "Anonymous";

            await prisma.chat.create({
                data:{
                    roomId,
                    message,
                    userId
                }
            })

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId,
                        userId: userId,
                        userName:userName
                    }))
                }
            })
        }
    })
})
