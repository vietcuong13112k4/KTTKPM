package transport;

public class Truck implements Transport {
    @Override
    public void deliver() {
        System.out.println("Giao hàng bằng đường bộ trong thùng xe tải.");
    }
}