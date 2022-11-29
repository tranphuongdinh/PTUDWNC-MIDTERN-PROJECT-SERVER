import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.EMAIL_API_KEY);

export const sendEmail = (fromEmail, toEmail, subject, content) => {
  const msg = {
    to: toEmail, // Change to your recipient
    from: fromEmail, // Change to your verified sender
    subject: subject,
    text: "and easy to do anywhere, even with Node.js",
    html: content,
  };

  sgMail
    .send(msg)
    .then((response) => {
      console.log('Send email success');
    })
    .catch((error) => {
      console.error({ error: error });
    });
};
