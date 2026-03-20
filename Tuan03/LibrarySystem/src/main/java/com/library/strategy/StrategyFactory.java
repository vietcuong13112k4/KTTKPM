package com.library.strategy;

/**
 * Factory nhỏ để tạo SearchStrategy từ chuỗi — dùng trong menu.
 */
public class StrategyFactory {
    public static SearchStrategy create(String type) {
        return switch (type.toLowerCase()) {
            case "author", "tac gia", "2" -> new ByAuthorStrategy();
            case "genre",  "the loai", "3" -> new ByGenreStrategy();
            default                         -> new ByTitleStrategy();
        };
    }
}
