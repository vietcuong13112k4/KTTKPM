package com.library.strategy;

import com.library.model.Book;
import java.util.List;

/**
 * ═══════════════════════════════════════════════════════════════
 * STRATEGY PATTERN — Giao diện chiến lược tìm kiếm
 * ═══════════════════════════════════════════════════════════════
 *
 * Mỗi chiến lược triển khai interface SearchStrategy.
 * SearchContext giữ một strategy hiện tại và uỷ thác việc
 * tìm kiếm cho nó — không cần biết thuật toán cụ thể.
 */
public interface SearchStrategy {
    /**
     * Thực thi tìm kiếm trên danh sách sách.
     * @param books danh sách toàn bộ sách
     * @param keyword từ khoá tìm kiếm
     * @return danh sách sách khớp
     */
    List<Book> search(List<Book> books, String keyword);

    /** Tên chiến lược hiển thị trong log */
    String strategyName();
}



