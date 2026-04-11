// Simple in-memory database
let orders = [];
let menu = [];

const initData = () => {
    menu = [
        { id: '1', name: 'Phở Bò', price: 55000, description: 'Phở bò truyền thống Hà Nội', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80' },
        { id: '2', name: 'Bún Chả', price: 45000, description: 'Bún chả nướng than hoa', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
        { id: '3', name: 'Bánh Mì', price: 25000, description: 'Bánh mì đặc biệt đầy đủ topping', image: 'https://images.unsplash.com/photo-1600454021970-351feb4a5149?auto=format&fit=crop&w=400&q=80' },
        { id: '4', name: 'Cà Phê Sữa Đá', price: 29000, description: 'Cà phê phin đậm đà', image: 'https://images.unsplash.com/photo-1544145945-f904253db0ad?auto=format&fit=crop&w=400&q=80' }
    ];
};

const getMenu = () => menu;
const getOrders = () => orders;
const getOrder = (id) => orders.find(o => o.id === id);

const addOrder = (order) => {
    orders.push(order);
};

const updateOrder = (id, updates) => {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        return orders[index];
    }
    return null;
};

const updateOrderStep = (orderId, stepName, status) => {
    const order = getOrder(orderId);
    if (order) {
        const stepIndex = order.steps.findIndex(s => s.name === stepName);
        if (stepIndex !== -1) {
            order.steps[stepIndex].status = status;
            order.steps[stepIndex].timestamp = new Date();
        }
        return order;
    }
    return null;
};

module.exports = {
    initData,
    getMenu,
    getOrders,
    getOrder,
    addOrder,
    updateOrder,
    updateOrderStep
};
