package com.library.model;

/**
 * Sách điện tử — được tạo bởi Factory Method khi type = "ebook"
 */
public class Ebook extends Book {
    private final String format; // PDF, EPUB, MOBI

    public Ebook(String id, String title, String author, String genre, String format) {
        super(id, title, author, genre);
        this.format = format;
    }

    @Override public String getType()     { return "Sách điện tử"; }
    @Override public String getTypeIcon() { return "💻"; }
    public String getFormat() { return format; }

    @Override
    public String toString() {
        return super.toString() + " | Định dạng: " + format;
    }
}
