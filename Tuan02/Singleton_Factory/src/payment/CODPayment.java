package payment;

public class CODPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Thanh toán COD: " + amount + " VND");
    }
}
