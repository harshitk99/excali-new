import express from "express"
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { mdiddleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from "cors";





const app=express();

app.use(express.json());
app.use(cors())
const prisma=prismaClient;



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
            id:user.id
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
        token
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


app.get('/chats/:roomId',async function(req,res){
    //@ts-ignore
    const roomId=req.query.roomId;
    const chats=await prisma.chat.findMany({
        where:{
    //@ts-ignore
            roomId:roomId
        },
        orderBy:{
            id:"desc"
        },
        take:50
    })

    res.json({
        chats
    })
})

app.get('/room/:slug',async function(req,res){
    const slug=req.params.slug;
    const room=await prisma.room.findUnique({
        where:{
            //@ts-ignore
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