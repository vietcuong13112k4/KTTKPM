package com.library.decorator;

import com.library.model.Book;

/**
 * Abstract Decorator — bọc một BorrowRequest khác.
 * Uỷ thác mọi phương thức về component bên trong,
 * các lớp con ghi đè để thêm hành vi.
 */
public abstract class BorrowDecorator implements BorrowRequest {

    protected final BorrowRequest wrapped;

    public BorrowDecorator(BorrowRequest wrapped) {
        this.wrapped = wrapped;
    }

    @Override public Book getBook()          { return wrapped.getBook(); }
    @Override public String getBorrower()    { return wrapped.getBorrower(); }
    @Override public int getDurationDays()   { return wrapped.getDurationDays(); }
    @Override public String getDescription() { return wrapped.getDescription(); }
}



