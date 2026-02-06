package invoice;

public class MomoInvoice implements Invoice {
    @Override
    public void printInvoice() {
        System.out.println("Hóa đơn MoMo được in.");
    }
}
