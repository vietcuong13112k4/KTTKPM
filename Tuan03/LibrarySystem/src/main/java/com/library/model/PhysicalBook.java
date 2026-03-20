package com.library.model;

/**
 * Sách giấy — được tạo bởi Factory Method khi type = "physical"
 */
public class PhysicalBook extends Book {
    private final int pages;

    public PhysicalBook(String id, String title, String author, String genre, int pages) {
        super(id, title, author, genre);
        this.pages = pages;
    }

    @Override public String getType()     { return "Sách giấy"; }
    @Override public String getTypeIcon() { return "📗"; }
    public int getPages() { return pages; }

    @Override
    public String toString() {
        return super.toString() + String.format(" | %d trang", pages);
    }
}
