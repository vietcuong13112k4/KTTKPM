package com.library.strategy;

import com.library.model.Book;
import java.util.List;

/**
 * ═══════════════════════════════════════════════════════════════
 * STRATEGY PATTERN — Context
 * ═══════════════════════════════════════════════════════════════
 *
 * SearchContext giữ tham chiếu đến SearchStrategy hiện tại.
 * Có thể thay chiến lược bất kỳ lúc nào qua setStrategy().
 * Client gọi search() — context uỷ thác cho strategy.
 */
public class SearchContext {

    private SearchStrategy strategy;

    public SearchContext(SearchStrategy initialStrategy) {
        this.strategy = initialStrategy;
    }

    /** Thay đổi chiến lược tại runtime */
    public void setStrategy(SearchStrategy strategy) {
        System.out.println("  [Strategy] SearchContext.setStrategy(" + strategy.strategyName() + ")");
        this.strategy = strategy;
    }

    /** Gọi tìm kiếm — uỷ thác cho strategy đang giữ */
    public List<Book> search(List<Book> books, String keyword) {
        System.out.println("  [Strategy] SearchContext.search(\"" + keyword
                + "\") — dùng: " + strategy.strategyName());
        List<Book> results = strategy.search(books, keyword);
        System.out.println("  [Strategy] Tìm thấy " + results.size() + " kết quả");
        return results;
    }

    public String currentStrategyName() { return strategy.strategyName(); }
}



