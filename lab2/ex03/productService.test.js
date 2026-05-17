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

    it('returned product slug matches the one that was discontinued', async () => {
        await Product.create({ name: 'jacket', slug: 'jacket-1', price: 80 });

        const result = await discontinue('jacket-1');

        expect(result.slug).toBe('jacket-1');
    });

    it('discontinuing one product does not affect other products', async () => {
        await Product.create({ name: 'shirt', slug: 'shirt-1', price: 20 });
        await Product.create({ name: 'pants', slug: 'pants-1', price: 40 });

        await discontinue('shirt-1');

        const pants = await Product.findOne({ slug: 'pants-1' });
        expect(pants.inStock).toBe(true);
    });

    it('discontinued product still has the correct name', async () => {
        await Product.create({ name: 'limited hoodie', slug: 'hoodie-1', price: 60 });

        const result = await discontinue('hoodie-1');

        expect(result.name).toBe('limited hoodie');
    });

});

describe('createProduct extra', () => {

    it('throws when name is missing', async () => {
        await expect(createProduct({ slug: 'shirt-1', price: 20 })).rejects.toThrow();
    });

    it('throws when slug is missing', async () => {
        await expect(createProduct({ name: 'shirt', price: 20 })).rejects.toThrow();
    });

    it('throws when price is missing', async () => {
        await expect(createProduct({ name: 'shirt', slug: 'shirt-1' })).rejects.toThrow();
    });

    it('saved price is exactly what was passed', async () => {
        const product = await createProduct({ name: 'shirt', slug: 'shirt-1', price: 99 });

        expect(product.price).toBe(99);
    });

    it('inStock can be explicitly set to false on creation', async () => {
        const product = await createProduct({ name: 'shirt', slug: 'shirt-1', price: 20, inStock: false });

        expect(product.inStock).toBe(false);
    });

    it('product is actually saved and can be found in the database', async () => {
        await createProduct({ name: 'shirt', slug: 'shirt-1', price: 20 });

        const found = await Product.findOne({ slug: 'shirt-1' });
        expect(found).not.toBeNull();
    });

    it('can create two products with different slugs without error', async () => {
        await createProduct({ name: 'shirt', slug: 'shirt-1', price: 20 });
        const second = await createProduct({ name: 'pants', slug: 'pants-1', price: 40 });

        expect(second.slug).toBe('pants-1');
    });

});

describe('getAvailableProducts extra', () => {

    it('returns empty array when the database is empty', async () => {
        const result = await getAvailableProducts();

        expect(result).toHaveLength(0);
    });

    it('returns empty array when all products are out of stock', async () => {
        await Product.create({ name: 'shirt', slug: 'shirt-1', price: 20, inStock: false });
        await Product.create({ name: 'pants', slug: 'pants-1', price: 40, inStock: false });

        const result = await getAvailableProducts();

        expect(result).toHaveLength(0);
    });

    it('returns multiple in-stock products', async () => {
        await Product.create({ name: 'shirt', slug: 'shirt-1', price: 20, inStock: true });
        await Product.create({ name: 'pants', slug: 'pants-1', price: 40, inStock: true });

        const result = await getAvailableProducts();

        expect(result).toHaveLength(2);
    });

    it('out of stock products are not included in the result at all', async () => {
        await Product.create({ name: 'shirt', slug: 'shirt-1', price: 20, inStock: true });
        await Product.create({ name: 'pants', slug: 'pants-1', price: 40, inStock: false });

        const result = await getAvailableProducts();

        const slugs = result.map(p => p.slug);
        expect(slugs).not.toContain('pants-1');
    });

});
