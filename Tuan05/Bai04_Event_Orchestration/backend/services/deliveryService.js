/**
 * DELIVERY SERVICE
 * Simulated courier assignment
 */
const scheduleCourier = async (orderId) => {
    // Random failure for demo (10% chance)
    const isSuccess = Math.random() > 0.1;

    return {
        success: isSuccess,
        trackingNumber: isSuccess ? `TRK-${Math.floor(Math.random() * 1000000)}` : null,
        message: isSuccess ? 'Courier assigned' : 'No couriers available'
    };
};

module.exports = {
    scheduleCourier
};
