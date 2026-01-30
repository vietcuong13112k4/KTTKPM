async function sendEmail(email, orderId) {
  console.log(`📨 Sending email to ${email}...`);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log(`📧 Email sent for order ${orderId}`);
}

module.exports = { sendEmail };
