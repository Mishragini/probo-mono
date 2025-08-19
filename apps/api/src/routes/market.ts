import { Router } from "express";
import { adminMiddleware, authenticatedRequest } from "../middleware/auth";
import { market_schema } from "@repo/utils/schema";
import { prisma } from "@repo/db/client";

export const market_router: Router = Router()

market_router.post("/create-market", adminMiddleware, async (req, res) => {
    try {
        const parsed_data = market_schema.safeParse(req.body)
        if (!parsed_data.success) {
            res.status(400).json({
                success: false,
                message: "Invalid inputs",
                error: parsed_data?.error
            })
            return;
        }

        // Convert ISO string to Date object for database storage
        const marketData = {
            ...parsed_data.data,
            endDate: new Date(parsed_data.data.endDate)
        };

        let new_market = await prisma.market.create({
            data: marketData
        })

        res.json({
            success: true,
            message: "Market created successfully",
            new_market
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        })
    }
})