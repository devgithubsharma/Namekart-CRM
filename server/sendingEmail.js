const nodemailer = require('nodemailer');
const dbConnection = require('./dbConnection'); 

let Sender = "devsharmabsr03@gmail.com";
let senderPassword = "ceociukdtcwrkanl";
// let MessageBody = "Sample Emails for testing";
// let Subject = "Sample emails";


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port : 587,
             auth: {
                 user: Sender,
                 pass: senderPassword
             }
     })

message = {
        from: "devsharmabsr03@gmail.com",
        to: "dev13bsr@gmail.com",
        subject: "Subject",
        text: "Hello SMTP Email"
}

transporter.sendMail(message, async function(err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
}

// Save email data to the database
const emailData = {
        sender: message.from,
        receiver: message.to,
        date: new Date(),
        subject: message.subject,
        messageBody: message.text,
      };

      try{
        const connection = await dbConnection.getConnection();
        // Insert email data into the database
        await insertEmailData(connection, emailData);

        // Release the connection back to the pool
        connection.release();

      }catch(error){
        console.error('Error saving email data to the database:', error);
      }
})

function insertEmailData(connection, emailData) {
        return new Promise((resolve, reject) => {
          const query = 'INSERT INTO sendingemails SET ?';
          connection.query(query, emailData, (error, results) => {
            if (error) {
              reject(error);
            } else {
              console.log('Email data saved to the database:', results);
              resolve(results);
            }
        });
});
}