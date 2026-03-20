package com.library.observer;

import com.library.model.Book;

/**
 * ═══════════════════════════════════════════════════════════════
 * OBSERVER PATTERN
 * ═══════════════════════════════════════════════════════════════
 *
 * LibraryObserver — interface mà mọi observer phải triển khai.
 * Khi Library (Subject) có sự kiện, nó gọi update() trên
 * từng observer đã đăng ký.
 */

// ─── Event object chứa thông tin sự kiện ─────────────────────────
public record LibraryEvent(EventType type, Book book, String borrower) {
    public enum EventType {
        NEW_BOOK,   // Thêm sách mới
        BORROWED,   // Sách được mượn
        RETURNED    // Sách được trả
    }
}
