/**
 * PAYMENT SERVICE
 * Simulated payment processing logic
 */
const processPayment = async (orderId) => {
    // Simulate complex validation
    // Random failure for demo (10% chance)
    const isSuccess = Math.random() > 0.1;
    
    return {
        success: isSuccess,
        transactionId: isSuccess ? `TX-${Date.now()}` : null,
        message: isSuccess ? 'Payment processed' : 'Insufficient funds'
    };
};

const refund = async (orderId) => {
    console.log(`[PaymentService] Refunded order ${orderId}`);
    return { success: true };
};

module.exports = {
    processPayment,
    refund
};
