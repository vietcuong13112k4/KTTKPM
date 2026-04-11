const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const orchestrator = require('./orchestrator');
const db = require('./data/store');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// API to get menu/data
app.get('/api/menu', (req, res) => {
    res.json(db.getMenu());
});

// API to get all orders
app.get('/api/orders', (req, res) => {
    res.json(db.getOrders());
});

// API to place an order - This triggers the Orchestrator
app.post('/api/orders', async (req, res) => {
    const { items, customer, total } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must have items' });
    }

    const orderId = uuidv4();
    const order = {
        id: orderId,
        customer,
        items,
        total,
        status: 'PENDING',
        steps: [
            { name: 'IDENTIFY', status: 'COMPLETED', timestamp: new Date() },
            { name: 'PAYMENT', status: 'WAITING', timestamp: null },
            { name: 'INVENTORY', status: 'WAITING', timestamp: null },
            { name: 'DELIVERY', status: 'WAITING', timestamp: null }
        ],
        createdAt: new Date()
    };

    db.addOrder(order);

    // Initial response to client that order is accepted
    res.status(202).json({ 
        message: 'Order received and is being processed',
        orderId: orderId 
    });

    // Run the Orchestrator in the background (or handle it async)
    // In a real-world scenario, this might be triggered by an event message
    orchestrator.handleOrderFlow(orderId);
});

// API to get order status
app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    db.initData();
});
