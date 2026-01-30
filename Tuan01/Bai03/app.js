const express = require("express");
const { sendEmail } = require("./email.service");
const { connectRabbitMQ, QUEUE_NAME } = require("./rabbitmq");

const app = express();
app.use(express.json());

const NO_MQ = process.env.NO_MQ === "true";
let channel = null;

(async () => {
  if (!NO_MQ) {
    channel = await connectRabbitMQ();
    console.log("✅ RabbitMQ connected");
  } else {
    console.log("❌ Running WITHOUT Message Queue");
  }
})();

app.post("/orders", async (req, res) => {
  console.time("TOTAL");

  const order = {
    id: Date.now(),
    email: req.body.email
  };

  console.log("✅ Order created:", order.id);

  if (NO_MQ) {
    await sendEmail(order.email, order.id);
  } else {
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(order)),
      { persistent: true }
    );
  }

  console.timeEnd("TOTAL");

  res.json({
    message: "Đặt hàng thành công",
    orderId: order.id,
    mode: NO_MQ ? "NO_MQ" : "RABBITMQ"
  });
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
