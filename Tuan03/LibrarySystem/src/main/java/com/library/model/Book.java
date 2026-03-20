package com.library.model;

/**
 * Lớp cơ sở đại diện cho một cuốn sách trong thư viện.
 */
public abstract class Book {
    private final String id;
    private final String title;
    private final String author;
    private final String genre;
    private boolean borrowed;
    private String borrowedBy;

    public Book(String id, String title, String author, String genre) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.borrowed = false;
        this.borrowedBy = null;
    }

    public abstract String getType();
    public abstract String getTypeIcon();

    // Getters
    public String getId()        { return id; }
    public String getTitle()     { return title; }
    public String getAuthor()    { return author; }
    public String getGenre()     { return genre; }
    public boolean isBorrowed()  { return borrowed; }
    public String getBorrowedBy(){ return borrowedBy; }

    // Setters
    public void setBorrowed(boolean borrowed)   { this.borrowed = borrowed; }
    public void setBorrowedBy(String borrowedBy){ this.borrowedBy = borrowedBy; }

    @Override
    public String toString() {
        return String.format("[%s] %s %-40s | Tác giả: %-20s | Thể loại: %-12s | %s",
                getTypeIcon(), id, "\"" + title + "\"", author, genre,
                borrowed ? "⚠ Đang mượn bởi: " + borrowedBy : "✓ Có sẵn");
    }
}
