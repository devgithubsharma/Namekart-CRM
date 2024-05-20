const dbConnection = require('../dbConnection'); 
const uuid = require('uuid'); 
const { htmlToText } = require('html-to-text');
const axios = require('axios')
const { getCurrentIndex, updateIndex } = require('../getSenderEmailIndex');

function fetchEmailTemplate(connection, sequenceId) {
    return new Promise((resolve, reject) => {
        console.log('sequenceId', sequenceId);
        const query = 'SELECT body FROM steps WHERE sequenceId = ?';
        connection.query(query, [sequenceId], (err, results) => {
            console.log('results', results);
            if (err) {
                console.log('Error in fetchEmailTemplate', err);
                reject(new Error('Error fetching email template: ' + err.message));
            } else if (results.length > 0) {
                resolve({
                    subject: results[0].subject,
                    body: results[0].body
                });
            } else {
                reject(new Error('No email template found for the provided sequenceId.'));
            }
        });
    });
}

function insertTitle(connection, title) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO titledata (title) VALUES (?)';
        connection.query(query, [title], (err, results) => {
            console.log('results', results);
            if (err) {
                console.log('Error in insertTitle', err);
                reject(new Error('Error in insertTitle: ' + err.message));
            } else if (results.affectedRows > 0) {  
                resolve({
                    titleId: results.insertId  
                });
            } else {
                reject(new Error('No rows inserted in insertTitle'));
            }
        });
    });
}

function insertCamp(connection, campName, titleId, campaign_type) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO camptable (camp_name, title_id, camp_type) VALUES (?, ?, ?)';
        connection.query(query, [campName, titleId, campaign_type], (err, results) => {
            console.log('results', results);
            if (err) {
                console.log('Error in insertCamp', err);
                reject(new Error('Error in insertCamp: ' + err.message));
            } else if (results.affectedRows > 0) { 
                resolve({
                    campId: results.insertId  
                });
            } else {
                reject(new Error('No rows inserted in insertTitle'));
            }
        });
    });
}

function insertThread(connection, campId, receiver_email) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO threads (campId, receiverEmails) VALUES (?,?)';
        connection.query(query, [campId, receiver_email], (err, results) => {
            console.log('results', results);
            if (err) {
                console.log('Error in insertThread', err);
                reject(new Error('Error in insertThread: ' + err.message));
            } else if (results.affectedRows > 0) {  
                resolve({
                    threadId: results.insertId 
                });
            } else {
                reject(new Error('No rows inserted in insertThread'));
            }
        });
    });
}


function insertData(connection, senderEmail, receiver_email, emailSubject,textBody, campId, messageId, threadId, start_date, domain_name) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO emailsdata (sender_email, receiver_email, subject, emailBody, campId ,messageId, emailType, threadId, sentTime, domainName, mailsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [senderEmail, receiver_email, emailSubject,textBody, campId, messageId, 'sent', threadId, start_date, domain_name, 1], (err, results) => {
            console.log('results', results);
            if (err) {
                console.log('Error in insertData', err);
                reject(new Error('Error in insertData: ' + err.message));
            } else if (results.affectedRows > 0) { 
                resolve({
                    response: "Email Data inserted"  
                });
            } else {
                reject(new Error('No rows inserted in insertData'));
            }
        });
    });
}


const sendLiveDetectEmails = async (req,res) =>{
    let connection;

    try{
        let response;
        connection = await dbConnection.getConnection();

        const camp_data = {
            campaign_type:"bulk",
            tags:['detectTagBulk'],
            start_date:"2024-05-02",
            campaigns:                      
            [
                {
                    domain_name: "abc.com",
                    contacts: [ {name: "Dummy-Manager", email: "dummy-manager@namekart.com", seqId:8} ]
                },
                {
                    domain_name: "abc.com",
                    contacts: [ {name: "Dummy-Employee", email: "dummy-employee@namekart.com", seqId:8} ]
                },
                {
                    domain_name: "abc.com",
                    contacts: [ {name: "Dev Sharma", email: "dev@namekart.com", seqId:8} ]
                }
            ]
        }

        const senderEmails = ['dummy-manager@namekart.com','dummy-employee@namekart.com']
        const senderName = 'abc';
        const returnCampId = [];

        const currentIndex = getCurrentIndex(); // Get the current index
        console.log('currentIndex',currentIndex)
        const senderEmail = senderEmails[currentIndex]; // Select the sender email based on the current index
        updateIndex(senderEmails.length); // Update the index for the next use


        const campaign_type = camp_data.campaign_type;
        const tags = camp_data.tags;
        const start_date = camp_data.start_date;
        const campaigns = camp_data.campaigns;


        if(campaign_type==="liveDetect"){
            for(let j = 0; j < campaigns.length; j++){
                const data = campaigns[j];
                const domain_name = data.domain_name;
                const contacts = data.contacts;
    
                let titleId;
                const title = `${domain_name}_detectLive`
                titleId = await insertTitle(connection,title);
                titleId = titleId.titleId;
                console.log('titleId',titleId)
                        
    
                const values = tags.map(tag => `('${tag}', ${titleId})`).join(', ');
                const query = `INSERT INTO tagsdata (tags, title_id) VALUES ${values};`;
                await connection.query(query);
        
                const campName = `${domain_name}_camp`
                const campaign = await insertCamp(connection, campName, titleId, campaign_type)
                const campId = campaign.campId;
    
                returnCampId.push({campId:campId, domainName:domain_name})
    
                let emailBody;
                const emailsToSend = await Promise.all(
                    contacts.map(async contact =>{
                        // const senderEmail = senderEmails[j % senderEmails.length];
                        const receiver_email = contact.email;
                        const receiver_name = contact.name;
                        const seqId = contact.seqId;
                        const emailSubject = domain_name;
                        let step_data = await fetchEmailTemplate(connection,seqId);
                        let body = step_data.body;
                        console.log('body',body)
        
                        const messageId = uuid.v4();
                        emailBody = body.replace('{{NAME}}', receiver_name)
                            .replace('{{DOMAIN}}', domain_name)
                            .replace('{{SENDER_NAME}}', senderName) 
                            + `<a href="{{{ pm:unsubscribe }}}" style="color: #1155cc;">Click here for Unsubscribe</a>`
                            + `<footer><p>Your Message ID: ${messageId}</p></footer>`;
    
                        const textBody = htmlToText(emailBody, {
                        wordwrap: 130
                        });
        
                        console.log('textBody',textBody);
        
                        const thread = await insertThread(connection, campId, receiver_email);
                        const threadId = thread.threadId;
                        console.log('threadId',threadId)
        
                        const emailData = await insertData(connection, senderEmail, receiver_email, emailSubject, textBody, campId, messageId, threadId, start_date, domain_name)
                        console.log('emailData',emailData.response)
        
                        return {
                            From: senderEmail, 
                            To: receiver_email,
                            Subject: emailSubject,
                            HtmlBody: emailBody,
                            TextBody: textBody,
                            ReplyTo:"83435bff2746386b6f339138dbb28fee@inbound.postmarkapp.com",
                            MessageStream: "broadcast",
                            TrackLinks: "HtmlOnly",
                            Headers: [{ Name: "X-Custom-Message-ID", Value: messageId }],
                            Metadata: {
                                conversationId: messageId, 
                                threadId: threadId
                            }
                        }; 
                    })
                )
    
                console.log('Below emailsToSend');
                console.log('emailsToSend',emailsToSend);
                console.log('After emailsToSend');
    
                response = await axios.post('https://api.postmarkapp.com/email/batch', emailsToSend, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-Postmark-Server-Token': '4ea16963-e553-4652-957d-80b9f0d90b3e'  
                        }
                    });
                
                    if (response.data) {
                        for(const resp of response.data) {
                            await connection.query('UPDATE emailsdata SET postmarkMessageId = ? WHERE receiver_email = ?', [resp.MessageID, resp.To]);
                        }
                    }          
            }

        }else{
            let allEmailsToSend = [];
            let titleId;
                const title = 'bulk-Camp';
                titleId = await insertTitle(connection, title);
                titleId = titleId.titleId;

                const values = tags.map(tag => `('${tag}', ${titleId})`).join(', ');
                const query = `INSERT INTO tagsdata (tags, title_id) VALUES ${values};`;
                await connection.query(query);

                const campName = 'BulkCampaign';
                const campaign = await insertCamp(connection, campName, titleId, campaign_type);
                const campId = campaign.campId;
                
            for (let j = 0; j < campaigns.length; j++) {
                const { domain_name, contacts } = campaigns[j];
                // const senderEmail = senderEmails[j % senderEmails.length]; // Rotate sender emails based on campaign index
                returnCampId.push({campId:campId, domainName:domain_name})

                for (const contact of contacts) {  // Changed to for...of loop
                    const { email: receiver_email, name: receiver_name, seqId } = contact;
        
                    const emailSubject = domain_name;
                    const step_data = await fetchEmailTemplate(connection, seqId);
                    if (!step_data.body) {
                        console.error('No email body available for sequence ID:', seqId);
                        continue;  // Skip this iteration if no body is found
                    }
                    const body = step_data.body;
        
                    const messageId = uuid.v4();
                    const emailBody = `${body.replace('{{NAME}}', receiver_name)
                        .replace('{{DOMAIN}}', domain_name)
                        .replace('{{SENDER_NAME}}', senderName)}
                        <a href="{{{ pm:unsubscribe }}}" style="color: #1155cc;">Click here for Unsubscribe</a>
                        <footer><p>Your Message ID: ${messageId}</p></footer>`;
        
                    const textBody = htmlToText(emailBody, { wordwrap: 130 });
        
                    allEmailsToSend.push({
                        From: senderEmail,
                        To: receiver_email,
                        Subject: emailSubject,
                        HtmlBody: emailBody,
                        TextBody: textBody,
                        ReplyTo: "83435bff2746386b6f339138dbb28fee@inbound.postmarkapp.com",
                        MessageStream: "broadcast",
                        TrackLinks: "HtmlOnly",
                        Headers: [{ Name: "X-Custom-Message-ID", Value: messageId }],
                        Metadata: {
                            conversationId: messageId,
                            threadId: uuid.v4()  // Assuming each email gets a new thread ID
                            }
                        });
                    }
                }
    
                console.log('allEmailsToSend',allEmailsToSend)
                // Send all emails in a single batch
                response = await axios.post('https://api.postmarkapp.com/email/batch', allEmailsToSend, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Postmark-Server-Token': '4ea16963-e553-4652-957d-80b9f0d90b3e'
                    }
                });
    
                if (response.data) {
                    for (const resp of response.data) {
                        await connection.query('UPDATE emailsdata SET postmarkMessageId = ? WHERE receiver_email = ?', [resp.MessageID, resp.To]);
                    }
                }
            }

    res.status(200).json({
                message: "Emails sent successfully",
                details: response.data, 
                returnCampId: returnCampId,
    });
             

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Failed to send emails",
            error: err.message
        });

    }finally {
        if (connection) {
            connection.release(); 
        }
    }
}

module.exports = {
    sendLiveDetectEmails,
}
