const Product = require('./product');

async function createProduct(data) {
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) {
        throw new Error('Slug already in use');
    }
    return await Product.create(data);
}

async function getAvailableProducts() {
    return await Product.find({ inStock: true });
}

async function discontinue(slug) {
    const product = await Product.findOneAndUpdate(
        { slug },
        { inStock: false },
        { new: true }
    );
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
}

module.exports = { createProduct, getAvailableProducts, discontinue };
