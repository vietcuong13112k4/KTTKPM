const { connectRabbitMQ, QUEUE_NAME } = require("./rabbitmq");

async function createOrder(email) {
  const order = {
    id: Date.now(),
    email
  };

  console.log("✅ Order created:", order.id);

  const channel = await connectRabbitMQ();
  channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(order)),
    { persistent: true }
  );

  console.log("📤 Job pushed to queue");
  return order;
}

module.exports = { createOrder };
