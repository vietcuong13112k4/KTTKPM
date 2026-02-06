package invoice;

public class CODInvoice implements Invoice {
    @Override
    public void printInvoice() {
        System.out.println("Hóa đơn COD được in.");
    }
}
