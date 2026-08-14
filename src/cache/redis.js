import { createClient } from "redis"

const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT
const REDIS_URL = `${REDIS_HOST}://${REDIS_HOST}:${REDIS_PORT}`

const redisClient = createClient({
    url: REDIS_URL,
})

redisClient.on("error", (err) => console.error("Redis Client Error", err))
await redisClient.connect()

export default redisClient