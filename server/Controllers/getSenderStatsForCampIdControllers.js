const dbConnection = require('../dbConnection');

const getSenderEmailsForCampId = async (req,res) =>{
    // const selectedCampaignType = req.params.selectedCampaignType;
    const sender_email = req.params.sender_email;
    const campId = req.params.campId;
    let connection;
    
    try{
        console.log('Connection 1')
        connection = await dbConnection.getConnection();
        console.log('Connection 2')
        const userQuery =  `
        SELECT 
            SUM(CASE WHEN emailType = 'sent' THEN 1 ELSE 0 END) AS emailsSent,
            SUM(CASE WHEN trackingStatus = 'open' THEN 1 ELSE 0 END) AS emailsOpened,
            SUM(CASE WHEN contactsClicked = 'yes' THEN 1 ELSE 0 END) AS contactsClicked
            FROM emailsdata
            WHERE sender_email = ? AND campId = ?`;

        await connection.query(userQuery,[sender_email,campId], (err,result) =>{
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
            
                res.status(201).json({result})
            }
        })

    }catch(err){
        res.status(500).send("Error getSenderEmailsForCampId");
    }finally{
        if(connection){
            connection.release();
        }
    }
}
 
module.exports = {
    getSenderEmailsForCampId,
}