package com.library.decorator;

/** Bản dịch ngôn ngữ — Concrete Decorator */
public class TranslationDecorator extends BorrowDecorator {
    private final String language;

    public TranslationDecorator(BorrowRequest wrapped, String language) {
        super(wrapped);
        this.language = language;
    }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " [Bản dịch: " + language + "]";
    }
}
