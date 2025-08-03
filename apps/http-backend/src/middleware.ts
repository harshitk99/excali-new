import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

export function mdiddleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers["authorization"] ?? ""

    const decoded=jwt.verify(token,JWT_SECRET as string)
    if(decoded){
        //@ts-ignore
        req.userId=decoded.userId;
        next();
    }
    else(
        res.status(403).json({
            message:"not authorized"
        })
    )
}