const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "email_queue";

async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

module.exports = { connectRabbitMQ, QUEUE_NAME };
