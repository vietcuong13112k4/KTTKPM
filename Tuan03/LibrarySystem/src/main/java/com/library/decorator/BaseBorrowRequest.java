package com.library.decorator;

import com.library.model.Book;

/**
 * Concrete Component — yêu cầu mượn cơ bản, 14 ngày.
 */
public class BaseBorrowRequest implements BorrowRequest {

    private final Book book;
    private final String borrower;

    public BaseBorrowRequest(Book book, String borrower) {
        this.book = book;
        this.borrower = borrower;
    }

    @Override public Book getBook()          { return book; }
    @Override public String getBorrower()    { return borrower; }
    @Override public int getDurationDays()   { return 14; }
    @Override public String getDescription() {
        return String.format("Mượn \"%s\" — %d ngày", book.getTitle(), getDurationDays());
    }
}
