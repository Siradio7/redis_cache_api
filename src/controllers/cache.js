import { getStats } from "../services/cache.js"

const getCacheStats = async (req, res) => {
    const stats = await getStats()

    return res.status(200).json(stats)
}

export { getCacheStats }