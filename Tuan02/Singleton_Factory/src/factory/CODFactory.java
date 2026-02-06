package factory;

import payment.*;
import invoice.*;

public class CODFactory implements PaymentAbstractFactory {

    @Override
    public Payment createPayment() {
        return new CODPayment();
    }

    @Override
    public Invoice createInvoice() {
        return new CODInvoice();
    }
}
