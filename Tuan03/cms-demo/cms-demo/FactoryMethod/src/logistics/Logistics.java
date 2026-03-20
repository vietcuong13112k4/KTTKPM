package logistics;
import transport.Transport;

// Đây là lớp Creator (Abstract Class)
public abstract class Logistics {

    // Đây chính là Factory Method
    public abstract Transport createTransport();

    // Nghiệp vụ chính: không quan tâm là xe hay tàu, cứ gọi deliver()
    public void planDelivery() {
        Transport t = createTransport();
        t.deliver();
    }
}