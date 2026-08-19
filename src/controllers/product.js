import { create, findById, updateById, deleteById } from "../services/product.js"

const createProduct = async (req, res) => {
    const productData = req.body

    if (!productData.name || !productData.description || productData.price === undefined) {
        return res.status(400).json({
            error: "Missing required fields"
        })
    }

    const product = await create(productData)

    return res.status(201).json(product)
}

const findProductById = async (req, res) => {
    const { id } = req.params
    const product = await findById(id)

    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        })
    }

    return res.status(200).json(product)
}

const updateProduct = async (req, res) => {
    const { id } = req.params
    const productData = req.body
    const isUpdated = await updateById(id, productData)

    if (!isUpdated) {
        return res.status(404).json({
            error: "Product not found"
        })
    }

    return res.status(200).json({
        message: "Product updated successfully"
    })
}

const deleteProduct = async (req, res) => {
    const { id } = req.params
    const isDeleted = await deleteById(id)

    if (!isDeleted) {
        return res.status(404).json({
            error: "Product not found"
        })
    }

    return res.status(204).send()
}

export { createProduct, findProductById, updateProduct, deleteProduct }