package payment;

public class MomoPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Thanh toán MoMo: " + amount + " VND");
    }
}
