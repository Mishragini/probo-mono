import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { user_router } from "./routes/user"
import { market_router } from "./routes/market"

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use("/api/user", user_router)
app.use("/api/market", market_router)

app.listen(5000, () => {
    console.log("Server listening on port 5000")
})