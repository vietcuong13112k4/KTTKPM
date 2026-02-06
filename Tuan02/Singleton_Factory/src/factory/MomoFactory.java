package factory;

import payment.*;
import invoice.*;

public class MomoFactory implements PaymentAbstractFactory {

    @Override
    public Payment createPayment() {
        return new MomoPayment();
    }

    @Override
    public Invoice createInvoice() {
        return new MomoInvoice();
    }
}
