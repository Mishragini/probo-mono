import { Router } from "express";
import { signup_schema, login_schema, onramp_schema } from "@repo/utils/schema"
import { prisma } from "@repo/db/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { authenticatedRequest, authMiddleware } from "../middleware/auth";
import { RedisManager } from "../utils/redisManager";

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

        let random_uuid = crypto.randomUUID()

        let redis_instance = RedisManager.getInstance()
        let reply_to = redis_instance.stream_name
        let stream_response = await redis_instance.sendAndAwait({
            type: "signup",
            data: {
                user_id: random_uuid,
                reply_to
            }
        })

        let engine_response = stream_response?.[0]?.message?.response

        if (!engine_response) {
            res.status(500).json({
                success: false,
                message: "No message from the engine."
            })
            return
        }

        let parsed_response = JSON.parse(engine_response)

        if (!parsed_response?.success) {
            res.status(500).json({
                success: false,
                message: parsed_response?.message || "Failed to add the user in the engine."
            })
            return
        }

        const hashed_password = await bcrypt.hash(password, 10)

        let new_user = await prisma.user.create({
            data: {
                id: random_uuid,
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

//usually we will hit the bank api or any third party api(razorpay) that will in turn call our webhook that will make changes in our db

user_router.post("/onramp/inr", authMiddleware, async (req: authenticatedRequest, res) => {
    try {
        // Validate the request body
        let parsed_data = onramp_schema.safeParse(req.body)
        if (!parsed_data.success) {
            res.status(400).json({
                success: false,
                message: "Invalid inputs",
                error: parsed_data?.error
            })
            return;
        }

        let { amount } = parsed_data.data;

        const amount_in_cents = Math.round(amount * 100);

        // Get user from auth middleware
        const user = req.user;

        // Update user's INR balance
        const updated_balance = await prisma.inrBalance.upsert({
            where: {
                userId: user?.id
            },
            update: {
                available: {
                    increment: amount_in_cents
                }
            },
            create: {
                available: amount_in_cents,
                user: {
                    connect: {
                        id: user?.id
                    }
                }
            }
        })

        res.json({
            success: true,
            message: `Successfully added ₹${amount} to your balance`,
            amount: amount,
            amount_in_cents: amount_in_cents,
            new_available_balance: updated_balance.available / 100 // Convert back to decimal for display
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        })
    }
})