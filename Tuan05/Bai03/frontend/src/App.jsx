import React, { useState, useEffect } from 'react';

const ORDER_SERVICE = 'http://localhost:3001';
const PAYMENT_SERVICE = 'http://localhost:3002';
const SHIPPING_SERVICE = 'http://localhost:3003';

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null); // { order_id, status, step }

  useEffect(() => {
    fetchProducts();
    // Poll for updates every 5 seconds if there are active orders
    const interval = setInterval(() => {
      refreshOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${ORDER_SERVICE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const refreshOrders = async () => {
    // In a real app, we'd fetch all orders for a user. 
    // For this demo, we'll just track the current one or fetch specific ones.
  };

  const placeOrder = async (product) => {
    setLoading(true);
    try {
      // 1. Create Order
      const orderRes = await fetch(`${ORDER_SERVICE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          total_price: product.price
        })
      });
      const orderData = await orderRes.json();
      const orderId = orderData.order_id;
      
      setProcessingOrder({ order_id: orderId, status: 'PENDING', step: 1, name: product.name });

      // 2. Simulate Payment (Delay for UX)
      await new Promise(r => setTimeout(r, 2000));
      const payRes = await fetch(`${PAYMENT_SERVICE}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, amount: product.price })
      });
      const payData = await payRes.json();
      setProcessingOrder(prev => ({ ...prev, status: 'PAID', step: 2 }));

      // 3. Arrange Shipping (Delay for UX)
      await new Promise(r => setTimeout(r, 2000));
      const shipRes = await fetch(`${SHIPPING_SERVICE}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      const shipData = await shipRes.json();
      setProcessingOrder(prev => ({ ...prev, status: 'SHIPPED', step: 3, tracking: shipData.tracking_number }));

      // Finish
      await new Promise(r => setTimeout(r, 2000));
      setOrders(prev => [{ id: orderId, name: product.name, status: 'SHIPPED', tracking: shipData.tracking_number }, ...prev]);
      setProcessingOrder(null);
      
    } catch (err) {
      console.error("Order workflow failed", err);
      alert("Something went wrong with the service communication.");
      setProcessingOrder(null);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Antigravity Gourmet</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
        Distributed Service Architecture Demo (Order + Payment + Shipping)
      </p>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-name">{product.name}</div>
            <div className="product-price">${product.price.toFixed(2)}</div>
            <button 
              className="btn" 
              onClick={() => placeOrder(product)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Order Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="order-history">
        <h2>Order Tracking</h2>
        <div className="card" style={{ marginTop: '1rem', padding: '0' }}>
          {orders.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No recent orders</div>}
          {orders.map(order => (
            <div key={order.id} className="order-item">
              <div>
                <div style={{ fontWeight: 'bold' }}>{order.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Order #{order.id}</div>
              </div>
              <div>
                {order.tracking && <div style={{ fontSize: '0.7rem', color: '#6366f1', marginBottom: '4px' }}>{order.tracking}</div>}
                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {processingOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1rem' }}>Processing Your Order</h2>
            <p>Ordering: <strong>{processingOrder.name}</strong></p>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(processingOrder.step / 3) * 100}%` }}
              ></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ color: processingOrder.step >= 1 ? '#818cf8' : '#475569' }}>Order Created</div>
              <div style={{ color: processingOrder.step >= 2 ? '#818cf8' : '#475569' }}>Payment Success</div>
              <div style={{ color: processingOrder.step >= 3 ? '#818cf8' : '#475569' }}>Shipping Arranged</div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              {processingOrder.step === 1 && "Connecting to Order Service..."}
              {processingOrder.step === 2 && "Verifying Payment Service..."}
              {processingOrder.step === 3 && "Notifying Shipping Service..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
