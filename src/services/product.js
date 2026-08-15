import redisClient from "../cache/redis.js"
import { create as createProduct, findById as findProductById, updateById as updateProductById } from "../repositories/product.js"

const create = async (productData) => {
    const productId = await createProduct(productData)
    const productCreated = await findProductById(productId)

    return productCreated
}

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

const updateById = async (id, productData) => {
    const isUpdated = await updateProductById(id, productData)

    if (isUpdated) {
        const redisProductKey = `product:${id}`

        try {
            await redisClient.del(redisProductKey)
        } catch (error) {
            console.error("Error deleting from Redis:", error)
        }
    }

    return isUpdated
}

export { create, findById, updateById }