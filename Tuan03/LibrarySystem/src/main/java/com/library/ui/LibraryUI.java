package com.library.ui;

import com.library.decorator.*;
import com.library.factory.BookFactory;
import com.library.model.Book;
import com.library.observer.MemberObserver;
import com.library.observer.StaffObserver;
import com.library.singleton.Library;
import com.library.strategy.SearchContext;
import com.library.strategy.StrategyFactory;

import java.util.List;
import java.util.Scanner;

/**
 * Giao diện console tương tác cho hệ thống quản lý thư viện.
 * Mỗi chức năng minh họa một Design Pattern tương ứng.
 */
public class LibraryUI {

    private final Library library;
    private final SearchContext searchContext;
    private final Scanner scanner;

    public LibraryUI() {
        // ── SINGLETON: lấy instance duy nhất ──────────────────
        this.library       = Library.getInstance();
        this.searchContext = new SearchContext(StrategyFactory.create("title"));
        this.scanner       = new Scanner(System.in);
    }

    // ════════════════════════════════════════════════════════════
    // Khởi tạo dữ liệu mẫu
    // ════════════════════════════════════════════════════════════
    public void seedData() {
        printBanner("KHỞI TẠO DỮ LIỆU MẪU");

        // Thêm observers trước để nhận sự kiện NEW_BOOK
        library.addObserver(new StaffObserver("Nguyễn Thủy Tiên"));
        library.addObserver(new MemberObserver("Trần Minh Khoa"));

        System.out.println("\n── Tạo sách bằng Factory Method ──────────────────────────");
        // FACTORY METHOD: tạo các loại sách khác nhau
        library.addBook(BookFactory.createPhysical("Số Đỏ", "Vũ Trọng Phụng", "Văn học", 320));
        library.addBook(BookFactory.createEbook("Sapiens: Lược Sử Loài Người", "Yuval Noah Harari", "Lịch sử", "EPUB"));
        library.addBook(BookFactory.createAudio("Đắc Nhân Tâm", "Dale Carnegie", "Kinh tế", 9.5));
        library.addBook(BookFactory.createPhysical("Nhà Giả Kim", "Paulo Coelho", "Văn học", 228));
        library.addBook(BookFactory.createEbook("Clean Code", "Robert C. Martin", "Kỹ thuật", "PDF"));
        library.addBook(BookFactory.createAudio("Tư Duy Nhanh Và Chậm", "Daniel Kahneman", "Khoa học", 13.0));
    }

    // ════════════════════════════════════════════════════════════
    // Menu chính
    // ════════════════════════════════════════════════════════════
    public void run() {
        seedData();

        while (true) {
            printMainMenu();
            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1" -> menuViewBooks();
                case "2" -> menuAddBook();
                case "3" -> menuBorrow();
                case "4" -> menuReturn();
                case "5" -> menuSearch();
                case "6" -> menuObservers();
                case "7" -> menuDecorator();
                case "0" -> {
                    System.out.println("\n  Tạm biệt! Hệ thống đã đóng.\n");
                    return;
                }
                default  -> System.out.println("  ⚠ Lựa chọn không hợp lệ.");
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    // 1. Xem danh sách sách
    // ════════════════════════════════════════════════════════════
    private void menuViewBooks() {
        printBanner("KHO SÁCH  [Singleton: Library.getInstance()]");
        List<Book> books = library.getAllBooks();
        if (books.isEmpty()) {
            System.out.println("  Thư viện chưa có sách.");
            return;
        }
        System.out.printf("  Tổng: %d cuốn | Có sẵn: %d | Đang mượn: %d%n%n",
                books.size(),
                library.getAvailableBooks().size(),
                library.getBorrowedBooks().size());
        books.forEach(b -> System.out.println("  " + b));
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // 2. Thêm sách — Factory Method
    // ════════════════════════════════════════════════════════════
    private void menuAddBook() {
        printBanner("THÊM SÁCH MỚI  [Factory Method Pattern]");
        System.out.println("  Chọn loại sách:");
        System.out.println("    1. Sách giấy  (PhysicalBook)");
        System.out.println("    2. Sách điện tử (Ebook)");
        System.out.println("    3. Sách nói    (AudioBook)");
        System.out.print("  > ");
        String typeChoice = scanner.nextLine().trim();

        System.out.print("  Tên sách   : "); String title  = scanner.nextLine().trim();
        System.out.print("  Tác giả    : "); String author = scanner.nextLine().trim();
        System.out.print("  Thể loại   : "); String genre  = scanner.nextLine().trim();

        Book book = switch (typeChoice) {
            case "2" -> {
                System.out.print("  Định dạng (PDF/EPUB/MOBI): ");
                String fmt = scanner.nextLine().trim();
                yield BookFactory.createEbook(title, author, genre, fmt.isEmpty() ? "PDF" : fmt);
            }
            case "3" -> {
                System.out.print("  Thời lượng (giờ): ");
                double h = parseDouble(scanner.nextLine().trim(), 8.0);
                yield BookFactory.createAudio(title, author, genre, h);
            }
            default -> {
                System.out.print("  Số trang: ");
                int p = parseInt(scanner.nextLine().trim(), 200);
                yield BookFactory.createPhysical(title, author, genre, p);
            }
        };

        library.addBook(book);
        System.out.println("\n  ✓ Đã thêm: " + book);
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // 3. Mượn sách — kích hoạt Observer
    // ════════════════════════════════════════════════════════════
    private void menuBorrow() {
        printBanner("MƯỢN SÁCH  [Observer Pattern]");
        List<Book> available = library.getAvailableBooks();
        if (available.isEmpty()) { System.out.println("  Không có sách nào sẵn."); pause(); return; }

        System.out.println("  Sách có sẵn:");
        available.forEach(b -> System.out.println("    " + b.getId() + " — " + b.getTitle()
                + " (" + b.getType() + ")"));

        System.out.print("\n  Nhập ID sách: "); String id       = scanner.nextLine().trim().toUpperCase();
        System.out.print("  Tên người mượn: "); String borrower = scanner.nextLine().trim();

        System.out.println();
        boolean ok = library.borrowBook(id, borrower);
        System.out.println(ok ? "\n  ✓ Mượn sách thành công." : "\n  ✗ Mượn sách thất bại.");
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // 4. Trả sách — kích hoạt Observer
    // ════════════════════════════════════════════════════════════
    private void menuReturn() {
        printBanner("TRẢ SÁCH  [Observer Pattern]");
        List<Book> borrowed = library.getBorrowedBooks();
        if (borrowed.isEmpty()) { System.out.println("  Không có sách nào đang được mượn."); pause(); return; }

        System.out.println("  Sách đang mượn:");
        borrowed.forEach(b -> System.out.println("    " + b.getId() + " — \""
                + b.getTitle() + "\" — mượn bởi: " + b.getBorrowedBy()));

        System.out.print("\n  Nhập ID sách cần trả: ");
        String id = scanner.nextLine().trim().toUpperCase();

        System.out.println();
        boolean ok = library.returnBook(id);
        System.out.println(ok ? "\n  ✓ Trả sách thành công." : "\n  ✗ Trả sách thất bại.");
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // 5. Tìm kiếm — Strategy Pattern
    // ════════════════════════════════════════════════════════════
    private void menuSearch() {
        printBanner("TÌM KIẾM SÁCH  [Strategy Pattern]");
        System.out.println("  Chọn chiến lược tìm kiếm:");
        System.out.println("    1. Theo tên sách   (ByTitleStrategy)");
        System.out.println("    2. Theo tác giả    (ByAuthorStrategy)");
        System.out.println("    3. Theo thể loại   (ByGenreStrategy)");
        System.out.print("  > ");
        String s = scanner.nextLine().trim();

        // STRATEGY: thay đổi chiến lược tại runtime
        searchContext.setStrategy(StrategyFactory.create(s));

        System.out.print("  Nhập từ khóa: ");
        String kw = scanner.nextLine().trim();

        List<Book> results = searchContext.search(library.getAllBooks(), kw);

        if (results.isEmpty()) {
            System.out.println("\n  Không tìm thấy kết quả nào.");
        } else {
            System.out.println("\n  Kết quả (" + results.size() + " cuốn):");
            results.forEach(b -> System.out.println("  " + b));
        }
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // 6. Quản lý Observers
    // ════════════════════════════════════════════════════════════
    private void menuObservers() {
        printBanner("QUẢN LÝ OBSERVERS  [Observer Pattern]");
        System.out.println("  Đang có " + library.getObserverCount() + " observer đã đăng ký.\n");
        System.out.println("  1. Thêm nhân viên (StaffObserver)");
        System.out.println("  2. Thêm thành viên (MemberObserver)");
        System.out.println("  0. Quay lại");
        System.out.print("  > ");
        String c = scanner.nextLine().trim();

        if (c.equals("1") || c.equals("2")) {
            System.out.print("  Tên: ");
            String name = scanner.nextLine().trim();
            if (c.equals("1")) library.addObserver(new StaffObserver(name));
            else                library.addObserver(new MemberObserver(name));
            System.out.println("  ✓ Đã đăng ký observer: " + name);
        }
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // 7. Decorator Pattern
    // ════════════════════════════════════════════════════════════
    private void menuDecorator() {
        printBanner("MƯỢN SÁCH NÂNG CAO  [Decorator Pattern]");
        List<Book> books = library.getAllBooks();
        if (books.isEmpty()) { System.out.println("  Thư viện chưa có sách."); pause(); return; }

        books.forEach(b -> System.out.println("  " + b.getId() + " — " + b.getTitle()));
        System.out.print("\n  Chọn ID sách: ");
        String id = scanner.nextLine().trim().toUpperCase();
        Book book = library.findById(id).orElse(books.get(0));

        System.out.print("  Tên người mượn: ");
        String borrower = scanner.nextLine().trim();

        // DECORATOR: bắt đầu với component gốc
        BorrowRequest request = new BaseBorrowRequest(book, borrower);
        System.out.println("\n  Áp dụng Decorators (y/n):");

        System.out.print("  [ExtendTimeDecorator]     Gia hạn +7 ngày? ");
        if (confirm()) request = new ExtendTimeDecorator(request);

        System.out.print("  [BrailleDecorator]        Chữ nổi Braille? ");
        if (confirm()) request = new BrailleDecorator(request);

        System.out.print("  [TranslationDecorator]    Bản dịch tiếng Việt? ");
        if (confirm()) {
            System.out.print("    Ngôn ngữ nguồn: ");
            String lang = scanner.nextLine().trim();
            request = new TranslationDecorator(request, lang.isEmpty() ? "Tiếng Anh" : lang);
        }

        System.out.print("  [PremiumEditionDecorator] Bìa cứng cao cấp? ");
        if (confirm()) request = new PremiumEditionDecorator(request);

        System.out.println("\n  ══════════════════════════════════════════════");
        System.out.println("  Yêu cầu mượn cuối cùng:");
        System.out.println("  " + request.getDescription());
        System.out.println("  Thời hạn: " + request.getDurationDays() + " ngày");
        System.out.println("  Người mượn: " + request.getBorrower());
        System.out.println("  ══════════════════════════════════════════════");
        pause();
    }

    // ════════════════════════════════════════════════════════════
    // Helper methods
    // ════════════════════════════════════════════════════════════
    private boolean confirm() {
        String ans = scanner.nextLine().trim().toLowerCase();
        return ans.equals("y") || ans.equals("yes") || ans.equals("có") || ans.equals("c");
    }

    private void printMainMenu() {
        System.out.println("\n╔══════════════════════════════════════════════════════╗");
        System.out.println("║       HỆ THỐNG QUẢN LÝ THƯ VIỆN — Design Patterns   ║");
        System.out.println("╠══════════════════════════════════════════════════════╣");
        System.out.println("║  1. Xem danh sách sách           [Singleton]         ║");
        System.out.println("║  2. Thêm sách mới                [Factory Method]    ║");
        System.out.println("║  3. Mượn sách                    [Observer]          ║");
        System.out.println("║  4. Trả sách                     [Observer]          ║");
        System.out.println("║  5. Tìm kiếm sách                [Strategy]          ║");
        System.out.println("║  6. Quản lý người theo dõi       [Observer]          ║");
        System.out.println("║  7. Mượn sách nâng cao           [Decorator]         ║");
        System.out.println("║  0. Thoát                                            ║");
        System.out.println("╚══════════════════════════════════════════════════════╝");
        System.out.print("  Chọn: ");
    }

    private void printBanner(String title) {
        System.out.println("\n┌─────────────────────────────────────────────────────┐");
        System.out.printf( "│  %-52s│%n", title);
        System.out.println("└─────────────────────────────────────────────────────┘");
    }

    private void pause() {
        System.out.print("\n  [Enter để tiếp tục...]");
        scanner.nextLine();
    }

    private int parseInt(String s, int def) {
        try { return Integer.parseInt(s); } catch (Exception e) { return def; }
    }

    private double parseDouble(String s, double def) {
        try { return Double.parseDouble(s); } catch (Exception e) { return def; }
    }
}
