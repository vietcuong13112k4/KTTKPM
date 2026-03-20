package com.library.strategy;

import com.library.model.Book;
import java.util.List;
import java.util.stream.Collectors;

/** Tìm theo tên sách */
public class ByTitleStrategy implements SearchStrategy {
    @Override
    public List<Book> search(List<Book> books, String keyword) {
        String kw = keyword.toLowerCase();
        return books.stream()
                .filter(b -> b.getTitle().toLowerCase().contains(kw))
                .collect(Collectors.toList());
    }
    @Override public String strategyName() { return "ByTitleStrategy"; }
}
