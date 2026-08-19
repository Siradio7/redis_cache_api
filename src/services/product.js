import redisClient from "../cache/redis.js"
import { acquireLock, releaseLock } from "../cache/lock.js"
import {
    create as createProduct,
    findById as findProductById,
    updateById as updateProductById,
    deleteById as deleteProductById
} from "../repositories/product.js"

const LOCK_TTL = 5

const create = async (productData) => {
    const productId = await createProduct(productData)
    const productCreated = await findProductById(productId)

    return productCreated
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const findById = async (id) => {
    if (process.env.CACHE_ENABLED !== "true") {
        return findProductById(id)
    }

    const redisProductKey = `product:${id}`
    const redisLockKey = `lock:product:${id}`

    try {
        const cachedProduct = await redisClient.get(redisProductKey)

        if (cachedProduct) {
            await redisClient.incr("stats:cache:hits")

            return JSON.parse(cachedProduct)
        }

        await redisClient.incr("stats:cache:misses")

        const lockValue = await acquireLock(redisLockKey, LOCK_TTL)

        if (lockValue) {
            try {
                const product = await findProductById(id)

                if (!product) {
                    return null
                }

                await redisClient.set(
                    redisProductKey,
                    JSON.stringify(product),
                    {
                        EX: Number(process.env.CACHE_TTL)
                    }
                )

                return product
            } finally {
                await releaseLock(redisLockKey, lockValue)
            }
        }

    } catch (error) {
        console.error("Error interacting with Redis:", error)
    }

    for (let attempt = 0; attempt < 10; attempt++) {
        await sleep(10)

        const cachedProduct = await redisClient.get(redisProductKey)

        if (cachedProduct) {
            await redisClient.incr("stats:cache:hits")

            return JSON.parse(cachedProduct)
        }
    }

    return findProductById(id)
}

const updateById = async (id, productData) => {
    const isUpdated = await updateProductById(id, productData)

    if (isUpdated && process.env.CACHE_ENABLED === "true") {
        const redisProductKey = `product:${id}`

        try {
            await redisClient.del(redisProductKey)
        } catch (error) {
            console.error("Error deleting from Redis:", error)
        }
    }

    return isUpdated
}

const deleteById = async (id) => {
    const isDeleted = await deleteProductById(id)

    if (isDeleted && process.env.CACHE_ENABLED === "true") {
        const redisProductKey = `product:${id}`

        try {
            await redisClient.del(redisProductKey)
        } catch (error) {
            console.error("Error deleting from Redis:", error)
        }
    }

    return isDeleted
}

export { create, findById, updateById, deleteById }