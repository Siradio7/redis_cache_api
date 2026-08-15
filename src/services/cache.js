import redisClient from "../cache/redis.js"

const getStats = async () => {
    try {
        const hits = Number(await redisClient.get("stats:cache:hits")) || 0
        const misses = Number(await redisClient.get("stats:cache:misses")) || 0

        const total = hits + misses
        const hitRate = total > 0 ? (hits / total) * 100 : 0

        return { hits, misses, total, hitRate }
    } catch (error) {
        console.error("Error retrieving cache stats:", error)

        return {
            hits: 0,
            misses: 0,
            total: 0,
            hitRate: 0
        }
    }
}

export { getStats }