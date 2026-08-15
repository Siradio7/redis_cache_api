import express from "express"
import { getStats } from "../services/cache.js"

const cacheRouter = express.Router()

cacheRouter.get("/stats", async (req, res) => {
    const stats = await getStats()
    
    return res.status(200).json(stats)
})

export default cacheRouter