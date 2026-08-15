import express from "express"
import { findById, updateById } from "../services/product.js"

const productRouter = express.Router()

productRouter.get("/:id", async (req, res) => {
    const { id } = req.params
    const product = await findById(id)

    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json(product)
})

productRouter.put("/:id", async (req, res) => {
    const { id } = req.params
    const productData = req.body
    const isUpdated = await updateById(id, productData)

    if (!isUpdated) {
        return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json({ message: "Product updated successfully" })
})

export default productRouter