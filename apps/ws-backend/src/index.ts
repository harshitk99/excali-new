import { WebSocketServer, WebSocket as WS } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
const prisma=prismaClient as any; // Type assertion to fix Prisma client issues
const wss=new WebSocketServer({port:8080});

interface User{
    userId:string,
    rooms:string[],
    ws:WS
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

function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    users.forEach(user => {
        if (user.rooms.includes(roomId.toString()) && user.userId !== excludeUserId) {
            try {
                user.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending message to user:', error);
            }
        }
    });
}

wss.on('connection',function connection(ws: WS,request){
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
    
    const user: User = {
        userId,
        rooms:[],
        ws
    };
    
    users.push(user);
    console.log(`User ${userId} connected. Total users: ${users.length}`);

    ws.on('message',async function message(data){
        try {
            const parsedData=JSON.parse(data as unknown as string);
            console.log('Received message:', parsedData);
            
            if(parsedData.type=="join_room"){
                const roomId = parsedData.roomId.toString();
                if (!user.rooms.includes(roomId)) {
                    user.rooms.push(roomId);
                    console.log(`User ${userId} joined room ${roomId}`);
                }
            }

            if(parsedData.type=="leave_room"){
                const roomId = parsedData.roomId.toString();
                user.rooms = user.rooms.filter(x => x !== roomId);
                console.log(`User ${userId} left room ${roomId}`);
            }
            
            if(parsedData.type=="draw"){
                const roomId=parsedData.roomId;
                const points=parsedData.points;
                const color=parsedData.color || "#000000";
                const strokeWidth=parsedData.strokeWidth || 2;
                const shapeType=parsedData.shapeType || "line";
                const x = parsedData.x;
                const y = parsedData.y;
                const width = parsedData.width;
                const height = parsedData.height;
                const radius = parsedData.radius;

                // Save drawing to database
                const drawing = await prisma.drawing.create({
                    data:{
                        roomId:roomId,
                        points:points,
                        userId:userId,
                        color: color,
                        strokeWidth: strokeWidth,
                        shapeType: shapeType,
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        radius: radius
                    },
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                });

                console.log(`Drawing saved: ${drawing.id} in room ${roomId}`);

                // Broadcast to all users in the room (except sender)
                broadcastToRoom(roomId.toString(), {
                    type:"draw",
                    drawing: drawing,
                    roomId: roomId
                }, userId);
                
                // Also send back to the sender to confirm the drawing was saved
                const sender = users.find(u => u.userId === userId);
                if (sender) {
                    try {
                        sender.ws.send(JSON.stringify({
                            type: "draw",
                            drawing: drawing,
                            roomId: roomId
                        }));
                    } catch (error) {
                        console.error('Error sending confirmation to sender:', error);
                    }
                }
            }

            if(parsedData.type=="delete_drawing"){
                const drawingId=parsedData.drawingId;
                const roomId=parsedData.roomId;

                // Check if user owns the drawing
                const drawing = await prisma.drawing.findFirst({
                    where:{
                        id: drawingId,
                        userId: userId
                    }
                });

                if(drawing){
                    // Delete from database
                    await prisma.drawing.delete({
                        where:{
                            id: drawingId
                        }
                    });

                    console.log(`Drawing deleted: ${drawingId} in room ${roomId}`);

                    // Broadcast deletion to all users in the room
                    broadcastToRoom(roomId.toString(), {
                        type:"delete_drawing",
                        drawingId: drawingId,
                        roomId: roomId
                    });
                }
            }

            if(parsedData.type=="clear_room"){
                const roomId=parsedData.roomId;

                // Check if user is admin of the room
                const room = await prisma.room.findFirst({
                    where:{
                        id: roomId,
                        adminId: userId
                    }
                });

                if(room){
                    // Delete all drawings from database
                    await prisma.drawing.deleteMany({
                        where:{
                            roomId: roomId
                        }
                    });

                    console.log(`Room cleared: ${roomId}`);

                    // Broadcast clear event to all users in the room
                    broadcastToRoom(roomId.toString(), {
                        type:"clear_room",
                        roomId: roomId
                    });
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        // Remove user from users array
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            const removedUser = users.splice(index, 1)[0];
            if (removedUser) {
                console.log(`User ${removedUser.userId} disconnected. Total users: ${users.length}`);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        // Remove user from users array on error
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            const removedUser = users.splice(index, 1)[0];
            if (removedUser) {
                console.log(`User ${removedUser.userId} disconnected due to error. Total users: ${users.length}`);
            }
        }
    });
});
