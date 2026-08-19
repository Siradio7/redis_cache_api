import express from "express"
import { getCacheStats } from "../controllers/cache.js"

const cacheRouter = express.Router()

cacheRouter.get("/stats", getCacheStats)

export default cacheRouter