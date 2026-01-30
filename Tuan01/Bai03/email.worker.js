const { connectRabbitMQ, QUEUE_NAME } = require("./rabbitmq");
const { sendEmail } = require("./email.service");

(async () => {
  const channel = await connectRabbitMQ();
  console.log("📩 Email Worker started");

  channel.prefetch(1);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const order = JSON.parse(msg.content.toString());
    console.log("📥 Worker received job:", order);

    try {
      await sendEmail(order.email, order.id);
      channel.ack(msg);
      console.log("✅ Job done\n");
    } catch (err) {
      console.error("❌ Error:", err.message);
      channel.nack(msg, false, true);
    }
  });
})();
