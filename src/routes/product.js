import express from "express"
import { create, findById, updateById, deleteById } from "../services/product.js"

const productRouter = express.Router()

productRouter.post("/", async (req, res) => {
    const productData = req.body

    if (!productData.name || !productData.description || productData.price === undefined) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    const productCreated = await create(productData)

    return res.status(201).json(productCreated)
})

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

productRouter.delete("/:id", async (req, res) => {
    const { id } = req.params
    const isDeleted = await deleteById(id)

    if (!isDeleted) {
        return res.status(404).json({ error: "Product not found" })
    }

    return res.status(204).send()
})

export default productRouter