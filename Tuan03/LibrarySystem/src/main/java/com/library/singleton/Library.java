package com.library.singleton;

import com.library.model.Book;
import com.library.observer.LibraryEvent;
import com.library.observer.LibraryEvent.EventType;
import com.library.observer.LibraryObserver;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * ═══════════════════════════════════════════════════════════════
 * SINGLETON PATTERN — Library
 * ═══════════════════════════════════════════════════════════════
 *
 * Chỉ có MỘT đối tượng Library duy nhất trong hệ thống.
 * - Constructor là private → không thể new Library() từ bên ngoài.
 * - getInstance() trả về instance duy nhất (lazy initialization,
 *   thread-safe với double-checked locking).
 *
 * Library cũng đóng vai trò SUBJECT trong Observer Pattern:
 * - addObserver() / removeObserver() để đăng ký/hủy theo dõi.
 * - notifyObservers() gọi update() trên mọi observer đã đăng ký.
 */
public class Library {

    // Volatile đảm bảo visibility qua các thread
    private static volatile Library instance;

    private final List<Book> books;
    private final List<LibraryObserver> observers;

    // ── Singleton: constructor private ──────────────────────────
    private Library() {
        books     = new ArrayList<>();
        observers = new ArrayList<>();
        System.out.println("  [Singleton] Library instance được tạo lần đầu tiên.");
    }

    // ── Singleton: double-checked locking ───────────────────────
    public static Library getInstance() {
        if (instance == null) {
            synchronized (Library.class) {
                if (instance == null) {
                    instance = new Library();
                }
            }
        }
        return instance;
    }

    // ════════════════════════════════════════════════════════════
    // Quản lý sách
    // ════════════════════════════════════════════════════════════

    public void addBook(Book book) {
        books.add(book);
        System.out.println("  [Singleton] Library.addBook() — tổng: " + books.size() + " cuốn");
        notifyObservers(new LibraryEvent(EventType.NEW_BOOK, book, null));
    }

    public boolean borrowBook(String bookId, String borrower) {
        Optional<Book> opt = findById(bookId);
        if (opt.isEmpty()) {
            System.out.println("  [Library] Không tìm thấy sách: " + bookId);
            return false;
        }
        Book book = opt.get();
        if (book.isBorrowed()) {
            System.out.println("  [Library] Sách \"" + book.getTitle() + "\" đang được mượn.");
            return false;
        }
        book.setBorrowed(true);
        book.setBorrowedBy(borrower);
        notifyObservers(new LibraryEvent(EventType.BORROWED, book, borrower));
        return true;
    }

    public boolean returnBook(String bookId) {
        Optional<Book> opt = findById(bookId);
        if (opt.isEmpty() || !opt.get().isBorrowed()) {
            System.out.println("  [Library] Sách không hợp lệ hoặc chưa được mượn.");
            return false;
        }
        Book book = opt.get();
        String borrower = book.getBorrowedBy();
        book.setBorrowed(false);
        book.setBorrowedBy(null);
        notifyObservers(new LibraryEvent(EventType.RETURNED, book, borrower));
        return true;
    }

    public List<Book> getAllBooks()       { return new ArrayList<>(books); }
    public List<Book> getAvailableBooks(){ return books.stream().filter(b -> !b.isBorrowed()).toList(); }
    public List<Book> getBorrowedBooks() { return books.stream().filter(Book::isBorrowed).toList(); }

    public Optional<Book> findById(String id) {
        return books.stream().filter(b -> b.getId().equals(id)).findFirst();
    }

    // ════════════════════════════════════════════════════════════
    // Observer Pattern — Subject methods
    // ════════════════════════════════════════════════════════════

    public void addObserver(LibraryObserver observer) {
        observers.add(observer);
        System.out.println("  [Observer] addObserver(" + observer.getName()
                + ") — tổng: " + observers.size() + " người theo dõi");
    }

    public void removeObserver(LibraryObserver observer) {
        observers.remove(observer);
        System.out.println("  [Observer] removeObserver(" + observer.getName() + ")");
    }

    private void notifyObservers(LibraryEvent event) {
        System.out.println("  [Observer] notifyObservers(" + event.type() + ") → "
                + observers.size() + " observers");
        for (LibraryObserver obs : observers) {
            obs.update(event);
        }
    }

    public int getObserverCount() { return observers.size(); }
}
