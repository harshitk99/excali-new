import { z } from "zod";

export const UserSchema=z.object({
    username:z.string().min(3).max(20),
    password:z.string().min(8).max(20),
    name:z.string().min(3).max(20)
})

export const SigninSchema=z.object({
    username:z.string().min(3).max(20),
    password:z.string().min(8).max(20)
})

export const CreateRoomSchema=z.object({
    name:z.string().min(3).max(20),
})

export type User=z.infer<typeof UserSchema>
export type Signin=z.infer<typeof SigninSchema>