package com.library.decorator;

/** Gia hạn thêm 7 ngày — Concrete Decorator */
public class ExtendTimeDecorator extends BorrowDecorator {
    public ExtendTimeDecorator(BorrowRequest wrapped) { super(wrapped); }

    @Override
    public int getDurationDays() { return wrapped.getDurationDays() + 7; }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " [+7 ngày gia hạn → tổng " + getDurationDays() + " ngày]";
    }
}
