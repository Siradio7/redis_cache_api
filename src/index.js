import express from "express"
import redisClient from "./cache/redis.js"
import productRouter from "./routes/product.js"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use("/products", productRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})