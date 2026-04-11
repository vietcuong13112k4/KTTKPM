const db = require('./data/store');
const paymentService = require('./services/paymentService');
const inventoryService = require('./services/inventoryService');
const deliveryService = require('./services/deliveryService');

/**
 * The Orchestrator manages the state machine of the order process.
 * It calls services sequentially and handles compensating transactions if a failure occurs.
 */
const handleOrderFlow = async (orderId) => {
    console.log(`[Orchestrator] Starting workflow for order: ${orderId}`);
    
    try {
        // --- STEP 1: PAYMENT ---
        db.updateOrderStep(orderId, 'PAYMENT', 'PROCESSING');
        await wait(2000); // Simulate network latency
        
        const paymentResult = await paymentService.processPayment(orderId);
        
        if (paymentResult.success) {
            db.updateOrderStep(orderId, 'PAYMENT', 'COMPLETED');
            console.log(`[Orchestrator] Payment successful for ${orderId}`);
        } else {
            throw new Error('PAYMENT_FAILED');
        }

        // --- STEP 2: INVENTORY ---
        db.updateOrderStep(orderId, 'INVENTORY', 'PROCESSING');
        await wait(2000);
        
        const inventoryResult = await inventoryService.deductStock(orderId);
        
        if (inventoryResult.success) {
            db.updateOrderStep(orderId, 'INVENTORY', 'COMPLETED');
            console.log(`[Orchestrator] Inventory deducted for ${orderId}`);
        } else {
            throw new Error('INVENTORY_FAILED');
        }

        // --- STEP 3: DELIVERY ---
        db.updateOrderStep(orderId, 'DELIVERY', 'PROCESSING');
        await wait(2000);
        
        const deliveryResult = await deliveryService.scheduleCourier(orderId);
        
        if (deliveryResult.success) {
            db.updateOrderStep(orderId, 'DELIVERY', 'COMPLETED');
            db.updateOrder(orderId, { status: 'CONFIRMED' });
            console.log(`[Orchestrator] Workflow completed successfully for ${orderId}`);
        } else {
            throw new Error('DELIVERY_FAILED');
        }

    } catch (error) {
        console.error(`[Orchestrator] Step failed: ${error.message}. Starting compensation...`);
        handleCompensation(orderId, error.message);
    }
};

/**
 * Compensating transactions (Rollback logic)
 */
const handleCompensation = async (orderId, failureStep) => {
    db.updateOrder(orderId, { status: 'FAILED' });
    
    // Reverse steps depending on where it failed
    if (failureStep === 'INVENTORY_FAILED' || failureStep === 'DELIVERY_FAILED') {
        console.log(`[Orchestrator] Compensating: Refunding payment for ${orderId}`);
        await paymentService.refund(orderId);
        db.updateOrderStep(orderId, 'PAYMENT', 'REFUNDED');
    }
    
    if (failureStep === 'DELIVERY_FAILED') {
        console.log(`[Orchestrator] Compensating: Restoring inventory for ${orderId}`);
        await inventoryService.restoreStock(orderId);
        db.updateOrderStep(orderId, 'INVENTORY', 'RESTORED');
    }

    db.updateOrderStep(orderId, failureStep.split('_')[0], 'FAILED');
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    handleOrderFlow
};
