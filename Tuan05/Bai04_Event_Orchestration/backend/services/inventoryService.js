/**
 * INVENTORY SERVICE
 * Simulated stock management
 */
const deductStock = async (orderId) => {
    // Random failure for demo (10% chance)
    const isSuccess = Math.random() > 0.1;

    return {
        success: isSuccess,
        message: isSuccess ? 'Items reserved' : 'Out of stock'
    };
};

const restoreStock = async (orderId) => {
    console.log(`[InventoryService] Restored stock for ${orderId}`);
    return { success: true };
};

module.exports = {
    deductStock,
    restoreStock
};
