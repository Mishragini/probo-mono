import express from "express"
import cors from "cors"
import { user_router } from "./routes/user"

const app = express()
app.use(express.json())
app.use(cors())

app.use("/api/user", user_router)

app.listen(5000, () => {
    console.log("Server listening on port 5000")
})