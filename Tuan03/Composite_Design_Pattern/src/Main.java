import java.util.ArrayList;
import java.util.List;

interface FileSystemComponent {
    void showDetails(String indent);
}

class File implements FileSystemComponent {
    private String name;

    public File(String name) {
        this.name = name;
    }

    @Override
    public void showDetails(String indent) {
        System.out.println(indent + "- File: " + name);
    }
}

class Directory implements FileSystemComponent {
    private String name;
    private List<FileSystemComponent> children = new ArrayList<>();

    public Directory(String name) {
        this.name = name;
    }

    public void addComponent(FileSystemComponent component) {
        children.add(component);
    }

    public void removeComponent(FileSystemComponent component) {
        children.remove(component);
    }

    @Override
    public void showDetails(String indent) {
        System.out.println(indent + "+ Directory: " + name);
        for (FileSystemComponent child : children) {
            child.showDetails(indent + "    ");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        FileSystemComponent file1 = new File("baitap.docx");
        FileSystemComponent file2 = new File("anh_the.png");
        FileSystemComponent file3 = new File("source_code.java");
        FileSystemComponent file4 = new File("luot_truy_cap.log");

        Directory myDocuments = new Directory("My Documents");
        myDocuments.addComponent(file1);
        myDocuments.addComponent(file2);

        Directory myProjects = new Directory("My Projects");
        myProjects.addComponent(file3);
        myProjects.addComponent(file4);


        Directory root = new Directory("Root (C:)");
        root.addComponent(myDocuments);
        root.addComponent(myProjects);
        root.addComponent(new File("system_info.txt")); // Thêm file trực tiếp vào Root


        System.out.println("--- CẤU TRÚC HỆ THỐNG TẬP TIN ---");
        root.showDetails("");
    }
}