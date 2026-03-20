package com.library.factory;

import com.library.model.*;

/**
 * ═══════════════════════════════════════════════════════════════
 * FACTORY METHOD PATTERN
 * ═══════════════════════════════════════════════════════════════
 *
 * Lớp BookFactory đóng vai trò Creator.
 * Client chỉ cần gọi BookFactory.create(type, ...) mà không cần
 * biết lớp cụ thể nào (PhysicalBook, Ebook, AudioBook) được tạo ra.
 *
 * Khi cần thêm loại sách mới, chỉ cần:
 *   1. Tạo lớp mới extends Book
 *   2. Thêm case vào switch bên dưới
 * → Không cần sửa code client.
 */
public class BookFactory {

    private static int counter = 1;

    /**
     * Factory Method chính — tạo sách giấy (PhysicalBook)
     */
    public static Book createPhysical(String title, String author, String genre, int pages) {
        String id = generateId();
        System.out.println("  [Factory] BookFactory.createPhysical() → new PhysicalBook(\"" + title + "\")");
        return new PhysicalBook(id, title, author, genre, pages);
    }

    /**
     * Factory Method — tạo sách điện tử (Ebook)
     */
    public static Book createEbook(String title, String author, String genre, String format) {
        String id = generateId();
        System.out.println("  [Factory] BookFactory.createEbook() → new Ebook(\"" + title + "\", " + format + ")");
        return new Ebook(id, title, author, genre, format);
    }

    /**
     * Factory Method — tạo sách nói (AudioBook)
     */
    public static Book createAudio(String title, String author, String genre, double hours) {
        String id = generateId();
        System.out.println("  [Factory] BookFactory.createAudio() → new AudioBook(\"" + title + "\", " + hours + "h)");
        return new AudioBook(id, title, author, genre, hours);
    }

    /**
     * Overloaded factory dùng String type — tiện cho menu tương tác
     */
    public static Book create(String type, String title, String author, String genre) {
        return switch (type.toLowerCase()) {
            case "ebook"  -> createEbook(title, author, genre, "PDF");
            case "audio"  -> createAudio(title, author, genre, 8.0);
            default       -> createPhysical(title, author, genre, 300);
        };
    }

    private static String generateId() {
        return String.format("B%03d", counter++);
    }
}
