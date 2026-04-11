# Hệ Thống Đặt Món Ăn - Event Orchestration (Saga Pattern)

Dự án này minh họa kiến trúc **Event Orchestration** (Điều phối sự kiện) sử dụng mẫu thiết kế **Saga Pattern**. Một bộ điều phối trung tâm (Orchestrator) quản lý toàn bộ quy trình đặt hàng và thực hiện các giao dịch bù đắp (compensating transactions) nếu có lỗi xảy ra.

## Thành Phần Hệ Thống

1.  **Frontend (React + Vite)**:
    *   Giao diện người dùng theo phong cách hiện đại (Dark Mode, Glassmorphism).
    *   Cho phép đặt món và theo dõi trạng thái đơn hàng theo thời gian thực (Polling).
    *   Hiển thị các bước trong quy trình: Tiếp nhận -> Thanh toán -> Kiểm kho -> Vận chuyển.

2.  **Backend (Node.js + Express)**:
    *   **Order Service**: Tiếp nhận đơn hàng.
    *   **Orchestrator**: Quản lý máy trạng thái (State Machine) của đơn hàng.
    *   **Simulated Services**: Payment, Inventory, Delivery (Mô phỏng các dịch vụ phân tán).
    *   **Compensating Transactions**: Logic hoàn tiền (Refund) và hoàn kho (Restore stock) nếu quy trình sau đó thất bại.

## Quy Trình Phối Hợp (Orchestration Flow)

1.  `Order Controller` nhận yêu cầu -> Tạo đơn hàng trạng thái `PENDING`.
2.  `Orchestrator` bắt đầu:
    *   Gọi `Payment Service` (Xử lý thanh toán).
    *   Nếu thành công, gọi `Inventory Service` (Giữ hàng).
    *   Nếu thành công, gọi `Delivery Service` (Giao hàng).
    *   Nếu tất cả thành công -> Đơn hàng `CONFIRMED`.
3.  **Xử lý lỗi (Compensation)**:
    *   Nếu `Inventory` lỗi -> `Orchestrator` gọi `Payment Service` để `Refund`.
    *   Nếu `Delivery` lỗi -> `Orchestrator` gọi `Inventory Service` để `Restore Stock` và `Payment Service` để `Refund`.

## Cách Chạy Dự Án

### 1. Cài đặt các gói phụ thuộc:
Mở terminal tại thư mục gốc và chạy:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Khởi chạy hệ thống:
Chạy lệnh sau tại thư mục gốc:
```bash
npm run dev
```

Hệ thống sẽ chạy tại:
*   Frontend: `http://localhost:3000`
*   Backend API: `http://localhost:5000`

## Dữ Liệu Demo
Hệ thống đã có sẵn dữ liệu món ăn (Phở Bò, Bún Chả, Bánh Mì, Cà Phê). Các bước xử lý được mô phỏng có độ trễ 2 giây để người dùng có thể quan sát quá trình điều phối.
