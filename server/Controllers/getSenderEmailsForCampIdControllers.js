const dbConnection = require('../dbConnection');

const getSenderEmailsForCampId = async (req,res) =>{
    // const selectedCampaignType = req.params.selectedCampaignType;
    const campId = req.params.campId
    let connection;
    try{
        console.log('Connection 1')
        connection = await dbConnection.getConnection();
        console.log('Connection 2')
        const userQuery = 'Select DISTINCT sender_email from emailsdata where campId=?';
        await connection.query(userQuery,[campId], (err,result) =>{
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
            
                res.status(201).json({result})
            }
        })

    }catch(err){
        
        res.status(500).send("Error fetching Campaign Data");
        
    }finally{
        if(connection){
            connection.release();
        }
    }
}
 
module.exports = {
    getSenderEmailsForCampId,
}