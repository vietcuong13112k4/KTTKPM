package com.library.decorator;

/** Bìa cứng cao cấp — Concrete Decorator */
public class PremiumEditionDecorator extends BorrowDecorator {
    public PremiumEditionDecorator(BorrowRequest wrapped) { super(wrapped); }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " [Bìa cứng cao cấp]";
    }
}
