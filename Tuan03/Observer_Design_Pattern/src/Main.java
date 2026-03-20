import java.util.ArrayList;
import java.util.List;
interface Observer {
    void update(String message); // Hàm này sẽ được gọi khi có thông báo mới
}


interface Subject {
    void attach(Observer observer); // Đăng ký theo dõi
    void detach(Observer observer); // Hủy theo dõi
    void notifyObservers();         // Gửi thông báo đến mọi người
}


class Stock implements Subject {
    private String symbol;
    private double price;
    private List<Observer> investors = new ArrayList<>(); // Danh sách nhà đầu tư

    public Stock(String symbol, double price) {
        this.symbol = symbol;
        this.price = price;
    }


    @Override
    public void attach(Observer observer) {
        investors.add(observer);
    }


    @Override
    public void detach(Observer observer) {
        investors.remove(observer);
    }


    @Override
    public void notifyObservers() {
        String message = "Cổ phiếu " + symbol + " vừa thay đổi giá thành: $" + price;
        for (Observer investor : investors) {
            investor.update(message);
        }
    }


    public void setPrice(double newPrice) {
        this.price = newPrice;
        System.out.println("\n[Hệ thống Cổ phiếu] Cập nhật giá " + symbol + " -> $" + price);
        notifyObservers();
    }
}

// Lớp Nhà đầu tư đóng vai trò là Người quan sát (Observer)
class Investor implements Observer {
    private String name;

    public Investor(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println("Nhà đầu tư " + name + " nhận thông báo: " + message);
    }
}


class Task implements Subject {
    private String taskName;
    private String status;
    private List<Observer> teamMembers = new ArrayList<>(); // Danh sách thành viên

    public Task(String taskName, String status) {
        this.taskName = taskName;
        this.status = status;
    }

    @Override
    public void attach(Observer observer) { teamMembers.add(observer); }

    @Override
    public void detach(Observer observer) { teamMembers.remove(observer); }

    @Override
    public void notifyObservers() {
        String message = "Task '" + taskName + "' đã chuyển trạng thái thành: " + status;
        for (Observer member : teamMembers) {
            member.update(message);
        }
    }

    public void setStatus(String newStatus) {
        this.status = newStatus;
        System.out.println("\n[Hệ thống Task] Cập nhật trạng thái '" + taskName + "' -> " + status);
        notifyObservers();
    }
}

class TeamMember implements Observer {
    private String name;

    public TeamMember(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println("Thành viên " + name + " nhận thông báo: " + message);
    }
}

public class Main {
    public static void main(String[] args) {
        Stock appleStock = new Stock("AAPL", 150.0);

        Observer investor1 = new Investor("Alice");
        Observer investor2 = new Investor("Bob");

        appleStock.attach(investor1);
        appleStock.attach(investor2);

        appleStock.setPrice(155.5);

        appleStock.detach(investor2);

        appleStock.setPrice(160.0);

        Task loginFeature = new Task("Tính năng Đăng nhập", "To Do");

        Observer dev1 = new TeamMember("Charlie (Dev)");
        Observer qa1 = new TeamMember("Diana (QA)");

        loginFeature.attach(dev1);
        loginFeature.attach(qa1);

        loginFeature.setStatus("In Progress");
        loginFeature.setStatus("Done");
    }
}