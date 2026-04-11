const socket = io();

// UI Elements
const placeOrderBtn = document.getElementById('placeOrderBtn');
const orderStatus = document.getElementById('orderStatus');
const statusText = document.getElementById('statusText');
const logContainer = document.getElementById('logContainer');

// Visualizer Nodes
const nodes = {
    placed: document.getElementById('node-order'),
    payment: document.getElementById('node-payment'),
    kitchen: document.getElementById('node-kitchen'),
    delivery: document.getElementById('node-delivery')
};

// State
let currentOrderId = null;

// Interactions
placeOrderBtn.addEventListener('click', async () => {
    placeOrderBtn.disabled = true;
    orderStatus.classList.remove('hidden');
    statusText.innerText = 'Transmitting order...';
    
    // Reset visualizer
    Object.values(nodes).forEach(node => {
        node.classList.remove('active', 'completed');
    });

    const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer: 'Guest User',
            items: ['Truffle Wagyu Burger']
        })
    });

    const data = await response.json();
    currentOrderId = data.orderId;
    
    addLog('System', 'Order Request Sent', `ID: ${currentOrderId}`);
});

// Socket Events
socket.on('order.update', (data) => {
    if (data.id !== currentOrderId) return;

    statusText.innerText = `Status: ${data.status}`;
    
    // Update visualizer based on choreography events
    updateVisualizer(data.status);
});

socket.on('event.log', (log) => {
    addLog(log.service, log.event, log.details);
});

async function fetchHistory() {
    try {
        const res = await fetch('/api/orders');
        const orders = await res.json();
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        orders.reverse().forEach(order => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div>
                    <strong>#${order.id}</strong><br>
                    <small>${new Date(order.timestamp).toLocaleString()}</small>
                </div>
                <span class="status-pill status-${order.status.toLowerCase()}">${order.status}</span>
            `;
            historyList.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to fetch history:', err);
    }
}

// Initial load
fetchHistory();

function updateVisualizer(status) {
    // Reset first
    Object.values(nodes).forEach(n => n.classList.remove('active'));

    switch(status) {
        case 'Placed':
            nodes.placed.classList.add('active', 'completed');
            break;
        case 'Paid':
            nodes.placed.classList.add('completed');
            nodes.payment.classList.add('active', 'completed');
            break;
        case 'Ready':
            nodes.placed.classList.add('completed');
            nodes.payment.classList.add('completed');
            nodes.kitchen.classList.add('active', 'completed');
            break;
        case 'Delivered':
            nodes.placed.classList.add('completed');
            nodes.payment.classList.add('completed');
            nodes.kitchen.classList.add('completed');
            nodes.delivery.classList.add('active', 'completed');
            
            // Refresh history
            fetchHistory();

            // Re-enable button
            setTimeout(() => {
                placeOrderBtn.disabled = false;
                statusText.innerText = 'Enjoy your meal!';
            }, 2000);
            break;
    }
}


function addLog(service, event, details) {
    const entry = document.createElement('div');
    entry.className = 'log-entry service';
    
    const time = new Date().toLocaleTimeString();
    
    entry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-service">[${service}]</span>
        <strong>${event}</strong>: ${details}
    `;
    
    logContainer.prepend(entry);
}
