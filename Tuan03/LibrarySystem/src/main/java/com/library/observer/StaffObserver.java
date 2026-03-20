package com.library.observer;

/**
 * ═══════════════════════════════════════════════════════════════
 * OBSERVER PATTERN — Concrete Observers
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Nhân viên thư viện ───────────────────────────────────────────
public class StaffObserver implements LibraryObserver {

    private final String name;

    public StaffObserver(String name) {
        this.name = name;
    }

    @Override
    public void update(LibraryEvent event) {
        String msg = switch (event.type()) {
            case NEW_BOOK -> String.format(
                    "  [Observer][Nhân viên: %s] Sách mới được thêm: \"%s\" (%s) — cần dán nhãn và xếp kệ.",
                    name, event.book().getTitle(), event.book().getType());
            case BORROWED -> String.format(
                    "  [Observer][Nhân viên: %s] Sách \"%s\" được mượn bởi: %s — cập nhật sổ theo dõi.",
                    name, event.book().getTitle(), event.borrower());
            case RETURNED -> String.format(
                    "  [Observer][Nhân viên: %s] Sách \"%s\" đã trả — kiểm tra tình trạng và xếp lại kệ.",
                    name, event.book().getTitle());
        };
        System.out.println(msg);
    }

    @Override public String getName() { return name; }
    @Override public String getRole() { return "Nhân viên thư viện"; }
}



