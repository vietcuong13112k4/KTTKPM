package invoice;

public class PaypalInvoice implements Invoice {
    @Override
    public void printInvoice() {
        System.out.println("Hóa đơn PayPal được in.");
    }
}
