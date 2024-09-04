// const dbConnection = require('../dbConnection');
var Imap = require('imap');
var MailParser = require("mailparser").MailParser;
const { google } = require('googleapis');
var Promise = require("bluebird");
const moment = require('moment-timezone');
const dbConnection = require('../dbConnection');
const { format } = require('date-fns');


/**
 * Extracts and returns the email address from a URL within the given text.
 * @param {string} text - The text containing the URL with the email address.
 * @returns {string|null} - The extracted email address, or null if not found.
 */
function extractMessageId(text) {
    console.log("Input text:", text);

    // Regular expression to find URLs starting with http or https
    const urlRegex = /https?:\/\/[^\s]+/g;
    let urlMatch;

    // Loop through all matches of URLs starting with http or https
    while ((urlMatch = urlRegex.exec(text)) !== null) {
        const url = urlMatch[0];

        // Decode the URL to handle URL-encoded characters
        const decodedUrl = decodeURIComponent(url);

        // Regular expression to extract the email address from the URL
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const emailMatches = decodedUrl.match(emailRegex);

        if (emailMatches) {
            return emailMatches[0];
        }
    }
    return null;
}

function getOriginalEmailDetails(connection, messageId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM emailsdata WHERE messageId = ?";
        connection.query(query, [messageId], (error, results) => {
            if (error) {
                console.error('Error fetching original email details', error);
                reject(error);
            } else if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve(null);
            }
        });
    });
}

const getTokensForSender = async (senderEmail, connection) => {
    console.log('getTokensForSender');
    try {
        return new Promise((resolve, reject) => {
            connection.query('SELECT refreshToken FROM sendertable WHERE sender_email_id = ?', [senderEmail], (err, result) => {
                if (err) {
                    console.error('Database error in getTokensForSender:', err);
                    reject(err);

                } else if (result.length > 0) {
                    const plainObject = JSON.parse(JSON.stringify(result[0]));
                    console.log('Resolve refresh token');
                    resolve({
                        refreshToken: plainObject.refreshToken,
                    });

                } else {
                    console.log(`No tokens found for ${senderEmail}`);
                    resolve({ refreshToken: null });
                }
            });
        });
    } catch (error) {
        console.error('Database error in getTokensForSender:', error);
        throw error;
    }
};


async function getGmailToken(refreshToken) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.Client_ID2,
            process.env.Client_secret2,
            process.env.REDIRECT_URI
        );
        oauth2Client.setCredentials({
            refresh_token: refreshToken
        });
        const { token } = await oauth2Client.getAccessToken();
        return token;
    } catch (err) {
        console.log("Error in getGmailToken", err)
        return null
    }
}


function getSenderEmails(connection) {
    return new Promise((resolve, reject) => {
        const query = 'Select sender_email_id from sendertable';
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error in query of fetching sender_email_id', error);
                reject(error);
            } else {
                console.log('Sender Emails fetched successfully');
                resolve(results);
            }
        });
    })
}

function insertReplyAsNewRow(connection, originalEmailDetails, mailMessageId, replyText, tag, formattedDate, inReplyMessageId) {
    console.log('insertReplyAsNewRow')
    return new Promise((resolve, reject) => {
        const { sender_email, receiver_email, subject, campId, messageId, mailsCount, contactsReplied, firstMailCount, followUpMailCount, mailType, threadId, domainName, leads, userId } = originalEmailDetails;
        const query = "INSERT INTO emailsdata (sender_email, receiver_email, subject, emailBody, campId, messageId, mailsCount, contactsReplied, firstMailCount, followUpMailCount, mailSequence, emailType, threadId, tag,domainName,leads,receivedTime, inReplyTo, userId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        connection.query(query, [sender_email, receiver_email, subject, replyText, campId, mailMessageId, mailsCount, contactsReplied, firstMailCount, followUpMailCount, mailType, 'received', threadId, tag, domainName, leads, formattedDate, inReplyMessageId, userId], (error, results) => {
            if (error) {
                console.error('Error inserting new reply row', error);
                reject(error);
            } else {
                console.log(`New reply inserted for messageId: ${messageId}`);
                resolve(results);
            }
        });
    });
}


function updateContactsRepliedInDatabase(messageId, connection) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE emailsdata SET contactsReplied = 1 WHERE messageId=?`;
        connection.query(query, [messageId], (error, results) => {
            if (error) {
                console.error('Error in updating contactsReplied count', error);
                reject(error);
            } else {
                console.log(`contactsReplied count updated for campaign ID: ${messageId}`);
                resolve(results);
            }
        })
    })
}

function getLastFetchTime(connection) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT lastFetchTime FROM repliesfetchtime WHERE id = 1';
        connection.query(query, (err, result) => {
            if (err) {
                console.log('Error in getLastFetchTime query', err)
            } else {
                console.log('Result of lastFetchTime ', result)
                resolve(result);
            }
        })
    })
}

function updateLastFetchTime(connection) {
    return new Promise((resolve, reject) => {
        let now = new Date();
        now = format(now, 'yyyy-MM-dd HH:mm:ss');
        const query = 'UPDATE repliesfetchtime SET lastFetchTime = ? WHERE id = 1';
        connection.query(query, [now], (err, result) => {
            if (err) {
                console.log('Error in updateLastFetchTime query', err)
                reject(err);
            } else {
                console.log('Time Updated successfully')
                resolve();
            }
        });
    })
}


async function getRepliesEmailData(imap, senderEmail, lastFetchTime) {
    return new Promise((resolve, reject) => {
        imap.search(["ALL", ["SINCE", lastFetchTime], ["TO", senderEmail]], function (err, results) {
            if (err) {
                reject(err);
                return;
            }

            if (!results || !results.length) {
                console.log(`No unread mails from ${senderEmail}`);
                resolve({ messageId: null, replyText: null });
                return;
            }

            let tag;
            let foundMessageId = null;
            let replyText = null;
            const fetchPromises = [];
            let mailMessageId = null;
            let emailDatas = [];
            let formattedDate;
            let extractedMessageId;

            var f = imap.fetch(results, {
                bodies: '',
                struct: true
            })

            f.on("message", function (msg, seqno) {
                const fetchPromise = new Promise((resolveMail, rejectMail) => {
                    var mailparser = new MailParser();

                    mailparser.on("error", error => {
                        console.error('MailParser error:', error);
                        rejectMail(error);
                    });

                    msg.on("body", function (stream, info) {
                        console.log(`Piping data to MailParser for seqno: ${seqno}, info: ${info.which}`);
                        stream.pipe(mailparser);
                    });

                    mailparser.on("headers", async function (headers) {
                        console.log('Mail header', headers);
                        let messageId = headers.get("in-reply-to");
                        formattedDate = headers.get("date")
                        formattedDate = format(formattedDate, 'yyyy-MM-dd HH:mm:ss');
                        if (formattedDate <= lastFetchTime) {
                            rejectMail('Email date is not newer than last fetch time');
                            return;
                        }
                        mailMessageId = headers.get('message-id')
                        mailMessageId = mailMessageId.replace(/^<|>$/g, '');

                        if (messageId) {
                            messageId = messageId.replace(/[<>]/g, '');
                            console.log('messageId', messageId);
                            foundMessageId = messageId;
                            tag = "chatReply";
                        } else {
                            tag = "separateMail";
                        }
                    });

                    mailparser.on("data", (data) => {
                        if (data.type === 'text') {
                            extractedMessageId = extractMessageId(data.text);
                            const lines = data.text.split('\n');
                            const originalMessageIndex = lines.findIndex(line => line.trim().startsWith('On ') && line.includes('wrote:'));
                            if (originalMessageIndex > 0) {
                                replyText = lines.slice(0, originalMessageIndex).join('\n').trim();
                            } else {
                                replyText = data.text.trim();
                            }
                            console.log(`Extracted Reply: ${replyText}`);
                        }
                    });

                    mailparser.on("end", () => {
                        let tag = foundMessageId ? "chatReply" : "separateMail";

                        if (formattedDate > lastFetchTime) {
                            emailDatas.push({ messageId: extractedMessageId, replyText: replyText, tag: tag, mailMessageId: mailMessageId, formattedDate: formattedDate });
                            resolveMail({ messageId: extractedMessageId, replyText: replyText, tag: tag, mailMessageId: mailMessageId, formattedDate: formattedDate });
                        } else {
                            rejectMail({ messageId: extractedMessageId, replyText: replyText, tag: tag, mailMessageId: mailMessageId, formattedDate: formattedDate })
                        }
                    });
                });

                fetchPromises.push(fetchPromise);

            });

            f.once("error", function (err) {
                console.log("Fetch error------------------: ", err);
                reject(err);
            });

            f.once("end", function () {
                fetchPromises.forEach((p, index) => console.log(`Promise ${index}:`, p));
                Promise.allSettled(fetchPromises).then((results) => {
                    const successfulResults = results.filter(result => result._settledValueField.tag === "chatReply")
                        .map(result => result._settledValueField);
                    console.log(`Successfully processed ${successfulResults.length} out of ${results.length} fetch operations.`);
                    resolve(successfulResults);
                }).catch(error => {
                    console.error('Error processing fetch promises:', error);
                    reject(error);
                });
            })
        });

    });
}

///////////////////////////////controller functions started////////////////////////////

//for checking api working correct or not
const processEmailConversationsapi = async (req, res) => {
    let connection;
    connection = await dbConnection.getConnection();
    const data = await processEmailConversations(connection);
    res.json({ data });
}

//for fetching, storing and updating status of reply
async function processEmailConversations(connection) {
    try {
        let datas = await getSenderEmails(connection);
        datas = datas.map(data => data.sender_email_id);
        const allMessages = [];
        let lastFetchTime = await getLastFetchTime(connection);
        lastFetchTime = lastFetchTime.map(data => data.lastFetchTime);
        lastFetchTime = lastFetchTime[0]
        lastFetchTime = format(lastFetchTime, 'yyyy-MM-dd HH:mm:ss');

        for (let sender of datas) {
            const tokens = await getTokensForSender(sender, connection);
            let accessToken = await getGmailToken(tokens.refreshToken);
            if (!accessToken) {
                continue;
            }
            let base64Encoded = Buffer.from([`user=${sender}`, `auth=Bearer ${accessToken}`, '', ''].join('\x01'), 'utf-8').toString('base64');

            var imap = new Imap({
                user: sender,
                xoauth2: base64Encoded,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                debug: console.log,
                authTimeout: 25000,
                connTimeout: 30000,
                tlsOptions: {
                    rejectUnauthorized: false,
                    servername: 'imap.gmail.com'
                }
            });

            Promise.promisifyAll(imap);
            await new Promise((resolve, reject) => {
                imap.once("ready", async function () {
                    imap.openBox("INBOX", false, async function (err, mailBox) {
                        if (err) {
                            console.error('Error inside openbox', err);
                            reject(err);
                            return;
                        }

                        try {
                            const messages = await getRepliesEmailData(imap, sender, lastFetchTime);
                            allMessages.push(...messages);

                            for (const message of messages) {
                                const { messageId, replyText, tag, mailMessageId, formattedDate } = message;
                                await updateContactsRepliedInDatabase(messageId, connection)
                                try {
                                    const originalEmail = await getOriginalEmailDetails(connection, messageId);
                                    if (originalEmail) {
                                        await insertReplyAsNewRow(connection, originalEmail, mailMessageId, replyText, tag, formattedDate, messageId);
                                    } else {
                                        console.log('No original email details found for:', messageId);
                                    }
                                } catch (error) {
                                    console.error('Error during database operation:', error);
                                }
                                console.log('After inserting new row');
                            }
                        } catch (error) {
                            console.error(`Error updating database: ${error}`);
                        }

                        imap.end();
                        resolve();
                    });
                });

                imap.once("error", function (err) {
                    console.log("IMAP connection error-------- " + err.stack);
                });

                imap.once('end', function () {
                    console.log('Connection ended----------');
                });

                imap.connect();

            });

        }
        console.log("Before updateLastFetchTime")
        await updateLastFetchTime(connection);
        return allMessages;
    } catch (err) {
        console.error('Error during the processEmailConversations:', err);
        throw err;
    }
}

module.exports = {
    processEmailConversations,
    processEmailConversationsapi,
}





