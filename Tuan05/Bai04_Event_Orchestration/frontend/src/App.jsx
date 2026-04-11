import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Package, CreditCard, Truck, CheckCircle, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchOrders, 3000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const menuRes = await axios.get(`${API_BASE}/menu`);
      setMenu(menuRes.data);
      fetchOrders();
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersRes = await axios.get(`${API_BASE}/orders`);
      setOrders(ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    }
  };

  const placeOrder = async (item) => {
    try {
      const res = await axios.post(`${API_BASE}/orders`, {
        items: [item],
        total: item.price,
        customer: 'Khách hàng Demo'
      });
      setActiveOrderId(res.data.orderId);
      fetchOrders();
    } catch (err) {
      alert('Lỗi đặt hàng');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Hệ Thống Đặt Món - Event Orchestration
        </h1>
        <p style={{ color: '#94a3b8' }}>Mô phỏng quy trình phối hợp dịch vụ (Saga Pattern - Orchestration)</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Loader2 className="animate-spin" size={48} color="#3b82f6" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* Menu Section */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={24} /> Thực Đơn Hôm Nay
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {menu.map((item) => (
                <motion.div 
                  key={item.id} 
                  className="glass-card" 
                  whileHover={{ scale: 1.02 }}
                  style={{ overflow: 'hidden' }}
                >
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px', height: '40px', overflow: 'hidden' }}>{item.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{item.price.toLocaleString()}đ</span>
                      <button className="btn-primary" onClick={() => placeOrder(item)}>Đặt Ngay</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Orders Tracking Section */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} /> Theo Dõi Đơn Hàng
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <AnimatePresence>
                {orders.length === 0 && <p style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Chưa có đơn hàng nào</p>}
                {orders.map((order) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={order.id} 
                    className="glass-card" 
                    style={{ padding: '20px', borderLeft: `4px solid ${order.status === 'CONFIRMED' ? '#10b981' : order.status === 'FAILED' ? '#ef4444' : '#3b82f6'}` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {order.id.substring(0, 8)}...</span>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.steps.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                          <StepIcon name={step.name} status={step.status} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{getStepLabel(step.name)}</span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{getStepStatusLabel(step.status)}</span>
                            </div>
                            <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: step.status === 'COMPLETED' ? '100%' : step.status === 'PROCESSING' ? '50%' : '0%' }}
                                style={{ height: '100%', background: step.status === 'COMPLETED' ? '#10b981' : '#3b82f6' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

const StepIcon = ({ name, status }) => {
  const icons = {
    IDENTIFY: Package,
    PAYMENT: CreditCard,
    INVENTORY: ShoppingCart,
    DELIVERY: Truck
  };
  const Icon = icons[name] || Package;
  
  if (status === 'COMPLETED') return <CheckCircle size={18} color="#10b981" />;
  if (status === 'FAILED') return <XCircle size={18} color="#ef4444" />;
  if (status === 'PROCESSING') return <Loader2 size={18} className="animate-spin" color="#3b82f6" />;
  if (status === 'REFUNDED' || status === 'RESTORED') return <ArrowRight size={18} color="#f59e0b" />;
  return <Clock size={18} color="#475569" />;
};

const getStepLabel = (name) => {
  const labels = {
    IDENTIFY: 'Tiếp nhận đơn',
    PAYMENT: 'Thanh toán',
    INVENTORY: 'Kiểm kho',
    DELIVERY: 'Vận chuyển'
  };
  return labels[name] || name;
};

const getStepStatusLabel = (status) => {
  const labels = {
    COMPLETED: 'Hoàn tất',
    PROCESSING: 'Đang xử lý...',
    WAITING: 'Chờ...',
    FAILED: 'Thất bại',
    REFUNDED: 'Đã hoàn tiền',
    RESTORED: 'Đã hoàn kho'
  };
  return labels[status] || status;
};

export default App;
