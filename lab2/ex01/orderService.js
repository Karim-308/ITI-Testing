const paymentService = require('./paymentService');
const emailService = require('./emailService');

async function placeOrder(order) {
    if (order.amount <= 0) {
        throw new Error('Invalid amount');
    }

    const result = await paymentService.charge(order.amount);

    if (!result.success) {
        throw new Error('Payment failed');
    }

    await emailService.sendOrderConfirmation(order.email, result.transactionId);

    return { orderId: order.id, transactionId: result.transactionId };
}

module.exports = { placeOrder };
