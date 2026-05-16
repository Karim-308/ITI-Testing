const { placeOrder } = require('./orderService');
const paymentService = require('./paymentService');
const emailService = require('./emailService');

jest.mock('./paymentService');
jest.mock('./emailService');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('placeOrder', () => {

    it('returns orderId and transactionId when order is valid', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        const result = await placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' });

        expect(result).toEqual({ orderId: 'order1', transactionId: 'txn123' });
    });

    it('calls sendOrderConfirmation with the correct email and transactionId', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        await placeOrder({ id: 'order1', amount: 100, email: 'user@test.com' });

        expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith('user@test.com', 'txn123');
    });

    it('throws Invalid amount and never calls charge when amount is 0', async () => {
        await expect(placeOrder({ id: 'order1', amount: 0, email: 'test@test.com' })).rejects.toThrow('Invalid amount');

        expect(paymentService.charge).not.toHaveBeenCalled();
    });

    it('throws Payment failed and never calls sendOrderConfirmation when charge returns success false', async () => {
        paymentService.charge.mockResolvedValue({ success: false });

        await expect(placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' })).rejects.toThrow('Payment failed');

        expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

    it('calls charge with the correct amount', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        await placeOrder({ id: 'order1', amount: 250, email: 'test@test.com' });

        expect(paymentService.charge).toHaveBeenCalledWith(250);
    });

    it('calls charge exactly once on a valid order', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        await placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' });

        expect(paymentService.charge).toHaveBeenCalledTimes(1);
    });

    it('calls sendOrderConfirmation exactly once on a valid order', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        await placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' });

        expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
    });

    it('returned orderId matches the id passed in the order', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        const result = await placeOrder({ id: 'my-special-order', amount: 100, email: 'test@test.com' });

        expect(result.orderId).toBe('my-special-order');
    });

    it('returned transactionId matches what charge returned', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'unique-txn-999' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        const result = await placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' });

        expect(result.transactionId).toBe('unique-txn-999');
    });

    it('throws Invalid amount when amount is negative', async () => {
        await expect(placeOrder({ id: 'order1', amount: -50, email: 'test@test.com' })).rejects.toThrow('Invalid amount');
    });

    it('never calls charge when amount is negative', async () => {
        await expect(placeOrder({ id: 'order1', amount: -1, email: 'test@test.com' })).rejects.toThrow('Invalid amount');

        expect(paymentService.charge).not.toHaveBeenCalled();
    });

    it('never calls sendOrderConfirmation when amount is 0', async () => {
        await expect(placeOrder({ id: 'order1', amount: 0, email: 'test@test.com' })).rejects.toThrow('Invalid amount');

        expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

    it('propagates the error when charge throws a network error', async () => {
        paymentService.charge.mockRejectedValue(new Error('network error'));

        await expect(placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' })).rejects.toThrow('network error');
    });

    it('never calls sendOrderConfirmation when charge throws an error', async () => {
        paymentService.charge.mockRejectedValue(new Error('network error'));

        await expect(placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' })).rejects.toThrow();

        expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

    it('propagates the error when sendOrderConfirmation throws', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockRejectedValue(new Error('email service down'));

        await expect(placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' })).rejects.toThrow('email service down');
    });

    it('result only contains orderId and transactionId', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        const result = await placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' });

        expect(Object.keys(result)).toEqual(['orderId', 'transactionId']);
    });

    it('works correctly with a minimal valid amount of 1', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'txn123' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        const result = await placeOrder({ id: 'order1', amount: 1, email: 'test@test.com' });

        expect(result).toEqual({ orderId: 'order1', transactionId: 'txn123' });
    });

    it('sendOrderConfirmation receives the transactionId that came from charge not a hardcoded value', async () => {
        paymentService.charge.mockResolvedValue({ success: true, transactionId: 'dynamic-txn-abc' });
        emailService.sendOrderConfirmation.mockResolvedValue();

        await placeOrder({ id: 'order1', amount: 100, email: 'test@test.com' });

        expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith('test@test.com', 'dynamic-txn-abc');
    });

    it('never calls sendOrderConfirmation when amount is negative', async () => {
        await expect(placeOrder({ id: 'order1', amount: -100, email: 'test@test.com' })).rejects.toThrow('Invalid amount');

        expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

});
