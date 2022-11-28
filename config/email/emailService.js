import sgMail from "@sendgrid/mail";

sgMail.setApiKey("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");

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
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error({ error: error });
    });
};
