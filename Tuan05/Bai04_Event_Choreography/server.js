const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const EventEmitter = require('events');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulated Event Bus
const eventBus = new EventEmitter();

// --- SERVICES (Demonstrating Event Choreography) ---

// 1. Order Service: Emits initial event
app.post('/api/order', (req, res) => {
    const order = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        items: req.body.items,
        customer: req.body.customer,
        timestamp: new Date(),
        status: 'PENDING'
    };

    console.log(`[Order Service] Order received: ${order.id}`);
    
    // In Choreography, we just emit the event and don't worry about what happens next.
    eventBus.emit('order.placed', order);
    
    res.status(202).json({ message: 'Order received and processing', orderId: order.id });
});

// 2. Payment Service: Listens for order.placed
eventBus.on('order.placed', async (order) => {
    console.log(`[Payment Service] Processing payment for order ${order.id}...`);
    io.emit('event.log', { service: 'Payment Service', event: 'Order Placed', details: `Processing payment for ${order.id}` });
    
    await new Promise(r => setTimeout(r, 2000)); // Simulate async work
    
    console.log(`[Payment Service] Payment successful for order ${order.id}`);
    eventBus.emit('payment.success', { ...order, status: 'PAID' });
});

// 3. Kitchen Service: Listens for payment.success
eventBus.on('payment.success', async (order) => {
    console.log(`[Kitchen Service] Received order ${order.id}. Starting preparation...`);
    io.emit('event.log', { service: 'Kitchen Service', event: 'Payment Success', details: `Preparing food for ${order.id}` });
    
    await new Promise(r => setTimeout(r, 1500));
    io.emit('event.log', { service: 'Kitchen Service', event: 'Preparing', details: `Cooking ${order.items.length} items...` });
    
    await new Promise(r => setTimeout(r, 3000));
    console.log(`[Kitchen Service] Food ready for order ${order.id}`);
    eventBus.emit('kitchen.completed', { ...order, status: 'READY_FOR_PICKUP' });
});

// 4. Delivery Service: Listens for kitchen.completed
eventBus.on('kitchen.completed', async (order) => {
    console.log(`[Delivery Service] Order ${order.id} is ready. Assigning driver...`);
    io.emit('event.log', { service: 'Delivery Service', event: 'Food Ready', details: `Finding closest driver for ${order.id}` });
    
    await new Promise(r => setTimeout(r, 2000));
    io.emit('event.log', { service: 'Delivery Service', event: 'Driver Assigned', details: `Driver John is on the way.` });
    
    await new Promise(r => setTimeout(r, 2500));
    console.log(`[Delivery Service] Order ${order.id} delivered!`);
    eventBus.emit('delivery.delivered', { ...order, status: 'DELIVERED' });
    io.emit('event.log', { service: 'Delivery Service', event: 'Delivered', details: `Order ${order.id} handed to customer.` });
});

// --- PERSISTENCE SERVICE (Simulating DB) ---
const fs = require('fs');
const dbPath = path.join(__dirname, 'db.json');

// Initialize DB structure
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ orders: [], eventLogs: [] }, null, 2));
}

const saveToDB = (collection, data) => {
    try {
        const db = JSON.parse(fs.readFileSync(dbPath));
        if (collection === 'orders') {
            const idx = db.orders.findIndex(o => o.id === data.id);
            if (idx > -1) db.orders[idx] = data;
            else db.orders.push(data);
        } else {
            db.eventLogs.push({ ...data, timestamp: new Date() });
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    } catch (err) {
        console.error('DB Error:', err);
    }
};

// Listen to all events for persistence (Choreography)
eventBus.on('order.placed', (order) => { 
    saveToDB('orders', order);
    io.emit('order.update', { ...order, status: 'Placed' });
});
eventBus.on('payment.success', (order) => {
    saveToDB('orders', order);
    io.emit('order.update', { ...order, status: 'Paid' });
});
eventBus.on('kitchen.completed', (order) => {
    saveToDB('orders', order);
    io.emit('order.update', { ...order, status: 'Ready' });
});
eventBus.on('delivery.delivered', (order) => {
    saveToDB('orders', order);
    io.emit('order.update', { ...order, status: 'Delivered' });
});

// Log all bus events for audit
const originalEmit = eventBus.emit;
eventBus.emit = function(event, ...args) {
    if (event !== 'newListener' && event !== 'removeListener') {
        saveToDB('eventLogs', { event, data: args[0] });
    }
    return originalEmit.apply(this, [event, ...args]);
};

// --- API Endpoints ---
app.get('/api/orders', (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbPath));
    res.json(db.orders);
});

app.get('/api/logs', (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbPath));
    res.json(db.eventLogs);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 GourmetDash Service running on http://localhost:${PORT}`);
    console.log(`📁 Database initialized at: ${dbPath}\n`);
});


