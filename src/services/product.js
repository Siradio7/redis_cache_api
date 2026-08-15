import redisClient from "../cache/redis.js"
import { findById as findProductById } from "../repositories/product.js"

const findById = async (id) => {
    const redisProductKey = `product:${id}`

    try {
        const cachedProduct = await redisClient.get(redisProductKey)

        if (cachedProduct) {
            return JSON.parse(cachedProduct)
        }
    } catch (error) {
        console.error("Error interacting with Redis:", error)
    }

    const product = await findProductById(id)

    if (!product) {
        return null
    }

    try {
        await redisClient.set(redisProductKey, JSON.stringify(product), {
            EX: Number(process.env.CACHE_TTL)
        })
    } catch (error) {
        console.error("Error storing in Redis:", error)
    }

    return product
}

export { findById }