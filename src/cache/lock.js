import redisClient from "./redis.js"
import crypto from "node:crypto"

const releaseLockScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
    end

    return 0
`

const acquireLock = async (key, ttl) => {
    const lockValue = crypto.randomUUID()

    const lockAcquired = await redisClient.set(key, lockValue, {
        NX: true,
        EX: ttl
    })

    return lockAcquired ? lockValue : null
}

const releaseLock = async (key, value) => {
    const result = await redisClient.eval(releaseLockScript, {
        keys: [key],
        arguments: [value]
    })

    return result === 1
}

export { acquireLock, releaseLock }