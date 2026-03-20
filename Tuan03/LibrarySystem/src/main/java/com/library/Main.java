package com.library;

import com.library.ui.LibraryUI;

/**
 * ═══════════════════════════════════════════════════════════════
 * Điểm khởi động ứng dụng — chạy file này trong IntelliJ IDEA
 * ═══════════════════════════════════════════════════════════════
 *
 * Design Patterns được sử dụng:
 *   1. Singleton     — Library (đảm bảo 1 instance duy nhất)
 *   2. Factory Method — BookFactory (tạo PhysicalBook/Ebook/AudioBook)
 *   3. Strategy      — SearchContext + ByTitle/ByAuthor/ByGenreStrategy
 *   4. Observer      — Library (Subject) + StaffObserver/MemberObserver
 *   5. Decorator     — BaseBorrowRequest + các lớp Decorator bọc nhau
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("Encoding: " + System.out.charset());
        LibraryUI ui = new LibraryUI();
        ui.run();
    }
}
