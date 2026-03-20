package com.library.observer;

/**
 * Thành viên thư viện — Concrete Observer
 */
public class MemberObserver implements LibraryObserver {

    private final String name;

    public MemberObserver(String name) {
        this.name = name;
    }

    @Override
    public void update(LibraryEvent event) {
        String msg = switch (event.type()) {
            case NEW_BOOK -> String.format(
                    "  [Observer][Thành viên: %s] Tin mới: Sách \"%s\" vừa được bổ sung!",
                    name, event.book().getTitle());
            case BORROWED -> String.format(
                    "  [Observer][Thành viên: %s] Sách \"%s\" hiện đang được mượn.",
                    name, event.book().getTitle());
            case RETURNED -> String.format(
                    "  [Observer][Thành viên: %s] Sách \"%s\" vừa trả — có thể mượn ngay!",
                    name, event.book().getTitle());
        };
        System.out.println(msg);
    }

    @Override public String getName() { return name; }
    @Override public String getRole() { return "Thành viên"; }
}
