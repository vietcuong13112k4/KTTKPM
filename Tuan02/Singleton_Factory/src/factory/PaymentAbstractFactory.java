package factory;

import payment.Payment;
import invoice.Invoice;

public interface PaymentAbstractFactory {
    Payment createPayment();
    Invoice createInvoice();
}
