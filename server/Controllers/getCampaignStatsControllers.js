const dbConnection = require('../dbConnection'); 

const campaignStats = async (req,res) =>{

    const campId = req.params.selectedCampaign;
    let connection;
    console.log('campId',campId)
    try{
        console.log('campaignStats Connection 1')
        connection = await dbConnection.getConnection();
        console.log('campaignStats Connection 2')
        const insertEmailQuery = `SELECT 
        COUNT(CASE WHEN trackingStatus = 'open' AND mailSequence = 'FirstMail' THEN 1 END) AS totalOpens,
        COUNT(CASE WHEN mailsCount = 1 AND mailSequence = 'FirstMail' THEN 1 END) AS totalMailCount,
        COUNT(CASE WHEN contactsClicked = 'yes' THEN 1 END) AS totalClicks,
        COUNT(CASE WHEN contactsUnsubscribed = 'yes' THEN 1 END) AS totalUnsubscribes,
        COUNT(CASE WHEN contactsReplied = 1 AND mailSequence = 'FirstMail' THEN 1 END) AS totalReplies,
        COUNT(CASE WHEN mailBounced = 'yes' AND mailSequence = 'FirstMail' THEN 1 END) AS totalBounced,
        COUNT(CASE WHEN firstMailCount = 1 THEN 1 END) AS totalFirstMails,
        COUNT(CASE WHEN followUpMailCount = 1 THEN 1 END) AS totalFollowUpMail,
        COUNT(CASE WHEN trackingStatus = 'open' AND mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpOpens,
        COUNT(CASE WHEN mailsCount = 1 AND mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpSent,
        COUNT(CASE WHEN contactsReplied = 1 AND mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpReplies,
        COUNT(CASE WHEN mailBounced = 'yes' AND mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpMailBounced,
        COUNT(CASE WHEN mailSequence = 'FirstMail' THEN 1 END) AS totalFirstMailSentCount,
        COUNT(CASE WHEN mailSequence = 'FollowUpMail' THEN 1 END) AS totalFollowUpMailSentCount
        FROM 
        emailsdata
        WHERE 
        campId = ?
        GROUP BY 
        campId;`

        await connection.query(insertEmailQuery,[campId], (err,result)=>{
            if(err){
                console.log('Error in campaignStats', err)
            }else{
                console.log(result)
                connection.release();
                res.json({totalMailsOpened:result.map(row => row.totalOpens), totalMailsCount:result.map(row => row.totalMailCount), totalClicks:result.map(row => row.totalClicks),totalUnsubscribes: result.map(row => row.totalUnsubscribes), totalReplies:result.map(row => row.totalReplies),totalBounced: result.map(row => row.totalBounced), totalFirstMails: result.map(row=>row.totalFirstMails),totalFollowUpMail: result.map(row=>row.totalFollowUpMail), totalFollowUpOpens:result.map(row=>row.totalFollowUpOpens),totalFollowUpSent: result.map(row=>row.totalFollowUpSent), totalFollowUpReplies:result.map(row=>row.totalFollowUpReplies), totalFollowUpMailBounced:result.map(row=>row.totalFollowUpMailBounced),totalFirstMailSentCount:result.map(row=>row.totalFirstMailSentCount),totalFollowUpMailSentCount:result.map(row=>row.totalFollowUpMailSentCount) })

            }
        })
        
    }catch(err){
        console.log(err)
        if(connection){
            connection.release();
        }
        res.status(500).send("Error during the Get Campaign Stats process.");
    }
}

module.exports = {
    campaignStats,
}