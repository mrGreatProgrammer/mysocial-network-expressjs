const nodemailer = require("nodemailer");

exports.sendMail = async (req, res) => {
  try {
    let emailAddressForSend = req.body.mail;
    let testEmailAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "testgmail@gmail.com",
        pass: "password",
      },
    });

    let result = await transporter.sendMail({
      from: '"mrGreatProgrammer" <testgmail@gmail.com>',
      to: emailAddressForSend,
      subject: "Change password",
      text: "To Change your password mrGreatProgrammer go to this link.",
      html: "To Change your password <strong>mrGreatProgrammer</strong> go to this link.",
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
