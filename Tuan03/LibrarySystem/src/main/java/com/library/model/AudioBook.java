package com.library.model;

/**
 * Sách nói — được tạo bởi Factory Method khi type = "audio"
 */
public class AudioBook extends Book {
    private final double durationHours;

    public AudioBook(String id, String title, String author, String genre, double durationHours) {
        super(id, title, author, genre);
        this.durationHours = durationHours;
    }

    @Override public String getType()     { return "Sách nói"; }
    @Override public String getTypeIcon() { return "🎧"; }
    public double getDurationHours() { return durationHours; }

    @Override
    public String toString() {
        return super.toString() + String.format(" | %.1f giờ", durationHours);
    }
}
