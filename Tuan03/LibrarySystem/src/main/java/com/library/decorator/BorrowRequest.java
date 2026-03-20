package com.library.decorator;

import com.library.model.Book;

/**
 * ═══════════════════════════════════════════════════════════════
 * DECORATOR PATTERN
 * ═══════════════════════════════════════════════════════════════
 *
 * BorrowRequest — Component interface.
 * BaseBorrowRequest — Concrete Component (thành phần gốc).
 * BorrowDecorator — Abstract Decorator (bọc component).
 * Các lớp cụ thể: ExtendTimeDecorator, BrailleDecorator,
 *                 TranslationDecorator, PremiumEditionDecorator.
 *
 * Cho phép xếp chồng nhiều tính năng bổ sung mà không sửa
 * lớp Book hay BaseBorrowRequest.
 */

// ─── Component Interface ──────────────────────────────────────────
public interface BorrowRequest {
    Book getBook();
    String getBorrower();
    int getDurationDays();
    String getDescription();
}
