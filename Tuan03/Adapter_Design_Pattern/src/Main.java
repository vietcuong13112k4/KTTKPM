interface JsonProcessor {
    String processJson(String jsonData);
}

class XmlSystem {
    public void receiveXml(String xmlData) {
        System.out.println("[XmlSystem] Đang nhận dữ liệu XML: " + xmlData);
    }

    public String responseXml() {
        return "<response><status>Thanh cong</status></response>";
    }
}

class XmlToJsonAdapter implements JsonProcessor {
    private XmlSystem xmlSystem;

    public XmlToJsonAdapter(XmlSystem xmlSystem) {
        this.xmlSystem = xmlSystem;
    }

    @Override
    public String processJson(String jsonData) {
        System.out.println("[Adapter] Nhận JSON: " + jsonData);

        String convertedXml = convertJsonToXml(jsonData);
        System.out.println("[Adapter] Chuyển đổi sang XML: " + convertedXml);

        xmlSystem.receiveXml(convertedXml);
        String xmlResponse = xmlSystem.responseXml();

        String jsonResponse = convertXmlToJson(xmlResponse);
        System.out.println("[Adapter] Chuyển phản hồi XML sang JSON: " + jsonResponse);

        return jsonResponse;
    }

    private String convertJsonToXml(String json) {
        return json.replace("{", "<data>").replace("}", "</data>").replace(":", "=");
    }

    private String convertXmlToJson(String xml) {
        return xml.replace("<response>", "{").replace("</response>", "}").replace("<status>", "\"status\": \"").replace("</status>", "\"");
    }
}

public class Main {
    public static void main(String[] args) {

        XmlSystem oldSystem = new XmlSystem();


        JsonProcessor adapter = new XmlToJsonAdapter(oldSystem);

        String requestJson = "{\"id\":101, \"name\":\"Product\"}";
        System.out.println("--- BẮT ĐẦU GIAO DỊCH ---");
        String finalResponse = adapter.processJson(requestJson);

        System.out.println("--- KẾT QUẢ CUỐI CÙNG ---");
        System.out.println("Client nhận được: " + finalResponse);
    }
}