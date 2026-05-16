const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createProduct, getAvailableProducts, discontinue } = require('./productService');
const Product = require('./product');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    await Product.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('createProduct', () => {

    it('creates a product with correct fields and inStock defaults to true', async () => {
        const product = await createProduct({ name: 'shirt', slug: 'shirt-1', price: 20 });

        expect(product.name).toBe('shirt');
        expect(product.slug).toBe('shirt-1');
        expect(product.inStock).toBe(true);
    });

    it('throws Slug already in use when slug is duplicate', async () => {
        await createProduct({ name: 'shirt', slug: 'shirt-1', price: 20 });

        await expect(createProduct({ name: 'another shirt', slug: 'shirt-1', price: 30 })).rejects.toThrow('Slug already in use');
    });

    it('throws a validation error when price is negative', async () => {
        await expect(createProduct({ name: 'shirt', slug: 'shirt-1', price: -5 })).rejects.toThrow();
    });

});

describe('getAvailableProducts', () => {

    it('returns only products where inStock is true', async () => {
        await Product.create({ name: 'shirt', slug: 'shirt-1', price: 20, inStock: true });
        await Product.create({ name: 'pants', slug: 'pants-1', price: 40, inStock: false });

        const result = await getAvailableProducts();

        expect(result).toHaveLength(1);
        expect(result[0].slug).toBe('shirt-1');
    });

});

describe('discontinue', () => {

    it('sets inStock to false and returns the updated product', async () => {
        await Product.create({ name: 'shirt', slug: 'shirt-1', price: 20 });

        const result = await discontinue('shirt-1');

        expect(result.inStock).toBe(false);
    });

    it('throws Product not found when slug does not exist', async () => {
        await expect(discontinue('ghost-slug')).rejects.toThrow('Product not found');
    });

});
