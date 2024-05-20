var Imap = require('imap')
// const { format, parse } = require('date-fns-tz');
var MailParser = require("mailparser").MailParser;
inspect = require('util').inspect;
var Promise = require("bluebird");
const dbConnection = require('./dbConnection');
// const htmlToText = require('html-to-text');
const { DateTime  } = require('luxon'); // Using Luxon library for date manipulation
Promise.longStackTraces();


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var imap  =new Imap( {
    user: 'devsharmabsr03@gmail.com',
    password: 'bpqrvdpcvhgaynlx',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

// var imap = new Imap(imapConfig);
Promise.promisifyAll(imap);

imap.once("ready", execute);
imap.once("error", function(err) {
    console.log("Connection error: " + err.stack);
});

imap.connect();


async function execute() {
  const emailsData = [];
  const connection = dbConnection.getConnection();
    imap.openBox("INBOX", false, function(err, mailBox) {
        if (err) {
            console.error(err);
            return;
        }
        const desiredDate = DateTime.fromObject({
          year: 2023,
          month: 12,
          day: 20,
         
      },{zone:'utc'}).toUTC();
      const formattedDate = desiredDate.toFormat('dd-MMM-yyyy');

        imap.search(["UNSEEN",['ON', formattedDate]], function(err, results) {
            if(!results || !results.length){
              console.log("No unread mails");
              imap.end();
              return;
            }
            
            var promises = results.map(seqno => fetchEmail(seqno,connection,emailsData)); 
            
            Promise.all(promises)
                .then((results) => { 
                    // console.log(results[0])     
                    // Promise.resolve(emailsArray[0])
                    imap.end();
                    return results[0]                  
                })
                .catch(err => console.error('Error in Execute: ', err)
                );
        });
    });
}

function fetchEmail(seqno,connection,emailsData) {
    return new Promise((resolve, reject) => {
        var f = imap.fetch(seqno, { bodies: '' });
        f.on("message", async function (msg, seqno) {
            // processMessage(msg, seqno, connection,emailsData)
            //     .then(()=> markAsSeen(seqno))
            //     .then((emailsData) => 
            //     resolve(emailsData))
            //     .catch(err => reject(err));
            const emailsArray = await processMessage(msg, seqno, connection,emailsData)
            resolve(emailsArray)
        });
        f.once("error", function (err) {
            reject(err);
        });
    });
}

function emailOrganize(emailBodiesHeader,emailBodyMessage){
  let organizedEmail;
  return new Promise((resolve) =>{
    try{
      // Create the JSON object
      organizedEmail = {
        sender:emailBodiesHeader.get('from').text,
        receiver:emailBodiesHeader.get('delivered-to').text,
        date:emailBodiesHeader.get('date'),
        subject:emailBodiesHeader.get('subject'),
        messageBody: emailBodyMessage,
        category: 'Not assigned'
        
      };
    }catch(err){
      console.log("Organize Data Error :", err)
    }
    resolve(organizedEmail);
  })
}


async function processMessage(msg, seqno,connection,emailsData) {
  let emailBodiesHeader;
  let emailBodyMessage;
  return new Promise(async (resolve, reject) => {

    var parser = new MailParser();

    function handleHeadersAsync(headers) {
      return new Promise((resolve) => {
        resolve(headers);
      });
    }

    function handleDataAsync(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }

    function extractReadableText(text) {
      // Remove newline characters and other unwanted characters
      const cleanedText = text.replace(/(\r\n|\n|\r)/gm, '').trim();
  
      return cleanedText;
  }
    
  parser.on("headers", async function(headers) {
      // console.log(emailBodiesHeader)

      emailBodiesHeader = await handleHeadersAsync(headers);
     
        
    });

    parser.on('data', async function(data) {
        if (data.type === 'text') {
            const plainText = await handleDataAsync(data.text)
          emailBodyMessage = extractReadableText(plainText);
          // console.log(plainText)
        }
    
    const emailData = await emailOrganize(emailBodiesHeader,emailBodyMessage)
    emailsData.push(emailData)
    

        // if (data.type === 'attachment') {
        //     console.log(data.filename);
        //     data.content.pipe(process.stdout);
        //     // data.content.on('end', () => data.release());
        // }
     });

    msg.on("body", function(stream) {
        stream.on("data", function(chunk) {
            parser.write(chunk.toString("utf8"));
        });

    });


    msg.once("end", function() {
        parser.end();

        //   // app.get('/api/receivingEmails', async (req, res) => {
        //   //   try {
        //   //     req.organizedEmail = organizedEmail;
        //   //     organizedEmailController(req, res);

        //   //   } catch (error) {
        //   //     console.error('Error fetching receiving emails:', error);
        //   //     res.status(500).json({ error: 'Internal Server Error' });
        //   //   }
        //   // });
      
        // }catch(err){
        //   console.log("Error in orgainized Email :", err)
        // }
        resolve(emailsData);
    });
    msg.once("error", function (err) {
      reject(err);
  });

  })
}

function markAsSeen(seqno) {
  return new Promise((resolve, reject) => {
      imap.setFlags(seqno, ['\\Seen'], function (err) {
          if (!err) {
              // console.log("Marked msg #" + seqno + " as seen");
              resolve();
          } else {
              // console.log("Error marking msg #" + seqno + " as seen: " + JSON.stringify(err, null, 2));
              reject(err);
          }
      });
  });
}

async function assignCategory(emailId, category, connection) {
  // Update the category in the database
  const [result] = await connection.execute(
      'UPDATE receivingemails SET category = ? WHERE emailId = ?',
      [category, emailId]
  );

  if (result.affectedRows === 1) {
      console.log(`Email with ID ${emailId} assigned to category: ${category}`);
  } else {
      console.log(`Email with ID ${emailId} not found or not updated.`);
  }
}


async function fetchAndSaveEmail(seqno, connection,msg) {
  const { emailBodiesHeader, emailBodyMessage } = await processMessage(msg,seqno);

  // Extract relevant information from headers
  const sender = emailBodiesHeader.get('return-path').text;
  const receiver = emailBodiesHeader.get('delivered-to').text;
  const date = emailBodiesHeader.get('date');
  const subject = emailBodiesHeader.get('subject');
  const messageBody = emailBodyMessage

  // Save the email data to the database
  // Save the email data to the database
const [rows, fields] = await connection.execute(
  'INSERT INTO receivingemails (sender, receiver, date, subject, messageBody, category) VALUES (?, ?, ?, ?, ?, notAssigned)',
  [sender, receiver, date, subject, messageBody]
);

  const emailId = rows.receiver;
  if(category==='Declined'){
    
    await assignCategory(emailId, 'Declined');

  }else if(category==='PQ'){

    await assignCategory(emailId, 'PQ');

  }else if(category==='Negotiation'){

    await assignCategory(emailId, 'Negotiation');

  }else{

    await assignCategory(emailId, 'Closed');
  }
  
}

module.exports = {
  execute,
  
}