import express from "express"
import { createProduct, findProductById, updateProduct, deleteProduct } from "../controllers/product.js"

const productRouter = express.Router()

productRouter.post("/", createProduct)
productRouter.get("/:id", findProductById)
productRouter.put("/:id", updateProduct)
productRouter.delete("/:id", deleteProduct)

export default productRouter