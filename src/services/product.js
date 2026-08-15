import redisClient from "../cache/redis.js"
import { create as createProduct, findById as findProductById, updateById as updateProductById, deleteById as deleteProductById } from "../repositories/product.js"

const create = async (productData) => {
    const productId = await createProduct(productData)
    const productCreated = await findProductById(productId)

    return productCreated
}

const findById = async (id) => {
    if (process.env.CACHE_ENABLED !== "true") {
        return await findProductById(id)
    }

    const redisProductKey = `product:${id}`

    try {
        const cachedProduct = await redisClient.get(redisProductKey)

        if (cachedProduct) {
            await redisClient.incr("stats:cache:hits")

            return JSON.parse(cachedProduct)
        }
        
        await redisClient.incr("stats:cache:misses")
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