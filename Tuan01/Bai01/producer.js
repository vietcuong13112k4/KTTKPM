const amqp = require('amqplib');

async function sendMessage() {
    try {
        // 1. Kết nối tới RabbitMQ Server
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = 'task_queue';
        const msg = 'Chào mừng bạn đến với RabbitMQ!';

        // 2. Đảm bảo queue tồn tại
        await channel.assertQueue(queueName, { durable: true });

        // 3. Gửi tin nhắn lên Queue
        channel.sendToQueue(queueName, Buffer.from(msg));
        console.log(`[x] Đã gửi: '${msg}'`);

        // Đóng kết nối sau khi gửi
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("Lỗi Producer:", error);
    }
}

sendMessage();