package payment;

public class PaypalPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Thanh toán PayPal: $" + amount);
    }
}
