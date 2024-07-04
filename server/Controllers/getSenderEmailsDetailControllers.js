const dbConnection = require('../dbConnection');
const {verifySendersEmails} = require('./sendingEmailsController.js');


const getSendersEmailsDetail = async (req, res) => {
    const userId = req.params.userId;

    let connection;
    try {
        connection = await dbConnection.getConnection();
        const query = 'SELECT * FROM sendertable WHERE user_id=?';

        connection.query(query, [userId], async (error, results) => {
            if (error) {
                console.log('Error in getting sender emails query', error);
                res.status(500).send('Error in fetching sender emails');
                return;
            }

            const emails = results.map(row => row.sender_email_id);

            const validationResult = await verifySendersEmails(emails,"simpleCampaign");

            const result = results.map(row => {
                const email = row.sender_email_id;
                const validationInfo = validationResult.find(item => item.email === email);

                return {
                    ...row,
                    isActive: validationInfo ? validationInfo.verified : false,
                };
            });

            res.status(200).json({result});
        });

    } catch (err) {
        console.error("Error in fetching Senders email Data:", err);
        res.status(500).send("Error in fetching Senders email Data");
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getSendersEmailsDetail
}