const amqp = require('amqplib');

async function receiveMessage() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = 'task_queue';

        await channel.assertQueue(queueName, { durable: true });

        console.log(`[*] Đang chờ tin nhắn trong ${queueName}. Nhấn CTRL+C để thoát.`);

        // 4. Nhận tin nhắn (Cơ chế Push từ Server)
        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                console.log(`[x] Đã nhận: ${msg.content.toString()}`);
                // Xác nhận đã xử lý xong để xóa tin khỏi hàng đợi
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Lỗi Consumer:", error);
    }
}

receiveMessage();