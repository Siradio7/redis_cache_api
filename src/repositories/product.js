import pool from "./mysql.js"

const findById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id])

    return rows[0] ?? null
}

export { findById }