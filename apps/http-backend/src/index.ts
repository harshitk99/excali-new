import express from "express"
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { mdiddleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from "cors";

const app=express();

app.use(express.json());
app.use(cors())
const prisma=prismaClient as any; // Type assertion to fix Prisma client issues

app.post('/signup',async function(req,res){
    const email=req.body.email;
    const password=req.body.password;
    const name=req.body.name;   
    //put in db
    //zod validation
    const user=await prisma.user.create({
        data:{
            email:email,
            password:password,
            name:name,
            photo:"https://picsum.photos/200/300"
        }
    })
    if(user){
        res.json({
            message:"you are signed up",
            id:user.id,
            userName: user.name
        })
    }else{
        res.status(403).json({
            message:"error while signing up"

        })
    }
})

app.post('/signin',async function(req,res){
    const email=req.body.email;
    const password=req.body.password

    const findUser=await prisma.user.findUnique({
        where:{
            email:email,
            password:password
        }
    })

    if(findUser){
        const userId=findUser.id;
    const token=jwt.sign({
        userId
        
    },JWT_SECRET as string)

    res.json({
        token,
        userName: findUser.name
    })
    }
    else{ 
        res.status(403).json({
            message:"error while signing in"
        })
    }
})

app.post('/room',mdiddleware,async function(req,res){
    const slug=req.body.slug;
    //@ts-ignore
    const adminId=req.userId;
    const roomNew=await prisma.room.create({
        data:{
            slug:slug,
            adminId:adminId
        }
    })

    res.json({

        roomId:roomNew.id,
        slug:slug
    })
})

app.get('/myrooms',mdiddleware,async function(req,res){
    //@ts-ignore
    const userId=req.userId
    const findRoom=await prisma.room.findMany({
        where:{
            adminId:userId
        }
    })
    res.json({
        findRoom
    })
})

app.get('/drawings/:roomId',async function(req,res){
    const roomId=parseInt(req.params.roomId);
    console.log("Fetching drawings for room:", roomId);
    const drawings=await prisma.drawing.findMany({
        where:{
            roomId:roomId
        },
        orderBy:{
            createdAt:"asc"  // Order by creation time, oldest first
        },
        take:100, // Allow more drawings than chats
        include: {
            user: {
                select: {
                    name: true
                }
            }
        }
    })

    console.log("Found drawings:", drawings.length);
    res.json({
        drawings
    })
})

app.post('/drawings',mdiddleware,async function(req,res){
    const roomId=req.body.roomId;
    const points=req.body.points;
    const color=req.body.color || "#000000";
    const strokeWidth=req.body.strokeWidth || 2;
    const shapeType=req.body.shapeType || "line";
    const x=req.body.x;
    const y=req.body.y;
    const width=req.body.width;
    const height=req.body.height;
    const radius=req.body.radius;
    //@ts-ignore
    const userId=req.userId;
    
    const drawing=await prisma.drawing.create({
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
    })

    res.json({
        drawing
    })
})

app.delete('/drawings/:drawingId',mdiddleware,async function(req,res){
    const drawingIdParam = req.params.drawingId;
    if (!drawingIdParam) {
        res.status(400).json({
            message:"Drawing ID parameter is required"
        })
        return;
    }
    
    const drawingId=parseInt(drawingIdParam);
    //@ts-ignore
    const userId=req.userId;
    
    // Only allow deletion if user owns the drawing
    const drawing=await prisma.drawing.findFirst({
        where:{
            id:drawingId,
            userId:userId
        }
    })

    if(!drawing){
        res.status(403).json({
            message:"You can only delete your own drawings"
        })
        return;
    }

    await prisma.drawing.delete({
        where:{
            id:drawingId
        }
    })

    res.json({
        message:"Drawing deleted successfully"
    })
})

app.delete('/drawings/clear/:roomId',mdiddleware,async function(req,res){
    const roomIdParam = req.params.roomId;
    if (!roomIdParam) {
        res.status(400).json({
            message:"Room ID parameter is required"
        })
        return;
    }
    
    const roomId=parseInt(roomIdParam);
    //@ts-ignore
    const userId=req.userId;
    
    // Check if user is admin of the room
    const room=await prisma.room.findFirst({
        where:{
            id:roomId,
            adminId:userId
        }
    })

    if(!room){
        res.status(403).json({
            message:"You can only clear rooms you own"
        })
        return;
    }

    // Delete all drawings in the room
    await prisma.drawing.deleteMany({
        where:{
            roomId:roomId
        }
    })

    res.json({
        message:"Room cleared successfully"
    })
})

app.get('/room/:slug',async function(req,res){
    const slug=req.params.slug;
    if (!slug) {
        res.status(400).json({
            message:"Slug parameter is required"
        })
        return;
    }
    
    const room=await prisma.room.findUnique({
        where:{
            slug:slug
        }
    })
    if(room == null){
        res.json({
            message:"error in finding room"
        })
        return;
    }
    res.json({
        roomId:room.id
        
    })
})

app.listen(3001);