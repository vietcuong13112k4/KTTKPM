package transport;

public class Ship implements Transport {
    @Override
    public void deliver() {
        System.out.println("Giao hàng bằng đường biển bằng container trên tàu thủy.");
    }
}