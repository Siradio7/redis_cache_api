import pool from "./mysql.js"

const findById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id])

    return rows[0] ?? null
}

const updateById = async (id, productData) => {
    const { name, description, price } = productData
    const [result] = await pool.query(
        "UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?",
        [name, description, price, id]
    )

    return result.affectedRows > 0
}

export { findById, updateById }