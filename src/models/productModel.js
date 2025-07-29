const db = require('../config/db');

const productModel = {
    // 获取所有产品的完整信息（关联名称、价格、类型、数量）
    getAllProducts: async () => {
        const [rows] = await db.query(`
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.code AS product_code,
                p.created_at,
                pp.price AS current_price,
                pt.type AS product_type,
                pq.amount AS remaining_quantity
            FROM 
                product p
            LEFT JOIN 
                product_price pp ON p.id = pp.id
            LEFT JOIN 
                product_type pt ON p.id = pt.id
            LEFT JOIN 
                product_quantity pq ON p.id = pq.id
            ORDER BY 
                p.id ASC
        `);
        
        // 处理可能的空值（如未设置价格/类型/数量时）
        return rows.map(product => ({
            product_id: product.product_id,
            product_name: product.product_name,
            product_code: product.product_code || 'N/A',
            created_at: product.created_at,
            current_price: product.current_price !== null ? 
                parseFloat(product.current_price) : null,
            product_type: product.product_type || 'Uncategorized',
            remaining_quantity: product.remaining_quantity !== null ? 
                parseInt(product.remaining_quantity) : 0
        }));
    },

    // 根据ID获取单个产品详情
    getProductById: async (productId) => {
        const [rows] = await db.query(`
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.code AS product_code,
                p.created_at,
                pp.price AS current_price,
                pt.type AS product_type,
                pq.amount AS remaining_quantity
            FROM 
                product p
            LEFT JOIN 
                product_price pp ON p.id = pp.id
            LEFT JOIN 
                product_type pt ON p.id = pt.id
            LEFT JOIN 
                product_quantity pq ON p.id = pq.id
            WHERE 
                p.id = ?
        `, [productId]);
        
        if (rows.length === 0) return null;
        
        const product = rows[0];
        return {
            product_id: product.product_id,
            product_name: product.product_name,
            product_code: product.product_code || 'N/A',
            created_at: product.created_at,
            current_price: product.current_price !== null ? 
                parseFloat(product.current_price) : null,
            product_type: product.product_type || 'Uncategorized',
            remaining_quantity: product.remaining_quantity !== null ? 
                parseInt(product.remaining_quantity) : 0
        };
    }
};

module.exports = productModel;