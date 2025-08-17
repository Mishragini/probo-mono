import { Router } from "express";
import { signup_schema, login_schema } from "@repo/utils/schema"
import { prisma } from "@repo/db/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const user_router: Router = Router()

user_router.post("/signup", async (req, res) => {
    try {
        let parsed_data = signup_schema.safeParse(req.body)
        if (!parsed_data.success) {
            res.status(400).json({
                success: false,
                message: "Invalid inputs",
                error: parsed_data?.error
            })
            return;
        }

        let { email, password, role } = parsed_data?.data

        let existing_user = await prisma.user.findFirst({
            where: {
                email
            }
        })

        if (existing_user) {
            res.status(400).json({
                success: false,
                message: "User with this email already exists."
            })
            return
        }

        const hashed_password = await bcrypt.hash(password, 10)

        let new_user = await prisma.user.create({
            data: {
                email,
                password: hashed_password,
                role
            }
        })

        let jwt_secret = process.env.JWT_SECRET as string

        let auth_token = jwt.sign({ user_id: new_user?.id }, jwt_secret, { expiresIn: "1d" })

        res.cookie('auth-token', auth_token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 1
        })

        res.json({
            success: true,
            message: "User registered successfully",
            new_user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        })
    }
})

user_router.post("/signin", async (req, res) => {
    try {
        let parsed_data = login_schema.safeParse(req.body)
        if (!parsed_data.success) {
            res.status(400).json({
                success: false,
                message: "Invalid inputs",
                error: parsed_data?.error
            })
            return;
        }

        let { email, password } = parsed_data?.data


        let existing_user = await prisma.user.findFirst({
            where: {
                email
            }
        })

        if (!existing_user) {
            res.status(400).json({
                success: false,
                message: "User with this email does not exist."
            })
            return
        }

        let password_matched = await bcrypt.compare(password, existing_user?.password)

        if (!password_matched) {
            res.status(400).json({
                success: false,
                message: "Wrong Password."
            })
            return
        }

        let jwt_secret = process.env.JWT_SECRET as string

        let auth_token = jwt.sign({ user_id: existing_user?.id }, jwt_secret, { expiresIn: "1d" })

        res.cookie('auth-token', auth_token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 1
        })

        res.json({
            success: true,
            message: "Logged in successfully",
            existing_user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        })
    }
})