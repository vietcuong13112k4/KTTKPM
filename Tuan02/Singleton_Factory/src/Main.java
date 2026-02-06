import factory.*;
import payment.Payment;
import invoice.Invoice;
import singleton.Logger;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Logger logger = Logger.getInstance();
        Scanner scanner = new Scanner(System.in);

        System.out.println("Chọn phương thức thanh toán:");
        System.out.println("1. COD");
        System.out.println("2. MoMo");
        System.out.println("3. PayPal");
        System.out.println("<=========>");

        int choice = scanner.nextInt();

        PaymentAbstractFactory factory = null;

        switch (choice) {
            case 1:
                factory = new CODFactory();
                break;
            case 2:
                factory = new MomoFactory();
                break;
            case 3:
                factory = new PaypalFactory();
                break;
            default:
                logger.error("Phương thức không hợp lệ!");
                return;
        }

        Payment payment = factory.createPayment();
        Invoice invoice = factory.createInvoice();

        logger.info("Bắt đầu thanh toán...");
        payment.pay(500000);
        invoice.printInvoice();
        logger.info("Thanh toán hoàn tất!");
    }
}
