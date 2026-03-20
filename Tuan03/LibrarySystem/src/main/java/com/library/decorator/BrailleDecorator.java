package com.library.decorator;

/** Phiên bản chữ nổi Braille — Concrete Decorator */
public class BrailleDecorator extends BorrowDecorator {
    public BrailleDecorator(BorrowRequest wrapped) { super(wrapped); }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " [Phiên bản chữ nổi Braille]";
    }
}
