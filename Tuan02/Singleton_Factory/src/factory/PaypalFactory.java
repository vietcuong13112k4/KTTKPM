package factory;

import payment.*;
import invoice.*;

public class PaypalFactory implements PaymentAbstractFactory {

    @Override
    public Payment createPayment() {
        return new PaypalPayment();
    }

    @Override
    public Invoice createInvoice() {
        return new PaypalInvoice();
    }
}
