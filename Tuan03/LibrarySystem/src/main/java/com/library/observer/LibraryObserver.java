package com.library.observer;

/**
 * Interface Observer — mọi người theo dõi đều implements cái này.
 */
public interface LibraryObserver {
    /** Được gọi bởi Library (Subject) khi có sự kiện */
    void update(LibraryEvent event);

    String getName();
    String getRole();
}
