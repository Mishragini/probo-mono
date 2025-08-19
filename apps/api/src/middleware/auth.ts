import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@repo/db/client";
import dotenv from "dotenv";

dotenv.config();

export interface authenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export async function adminMiddleware(req: authenticatedRequest, res: Response, next: NextFunction) {
    try {
        const auth_token = req.cookies['auth-token'];

        if (!auth_token) {
            res.status(401).json({
                success: false,
                message: "Authentication token not found. Please login first."
            });
            return
        }

        const jwt_secret = process.env.JWT_SECRET as string;
        if (!jwt_secret) {
            res.status(500).json({
                success: false,
                message: "JWT secret not configured"
            });
            return
        }

        let decoded = jwt.verify(auth_token, jwt_secret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.user_id
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found"
            });
            return
        }

        if (user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
            return
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error during authentication"
        });
    }
}

export async function authMiddleware(req: authenticatedRequest, res: Response, next: NextFunction) {
    try {
        const auth_token = req.cookies['auth-token'];

        if (!auth_token) {
            res.status(401).json({
                success: false,
                message: "Authentication token not found. Please login first."
            });
            return
        }


        const jwt_secret = process.env.JWT_SECRET as string;
        if (!jwt_secret) {
            res.status(500).json({
                success: false,
                message: "JWT secret not configured"
            });
            return
        }

        let decoded = jwt.verify(auth_token, jwt_secret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.user_id
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found"
            });
            return
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error during authentication"
        });
    }
}