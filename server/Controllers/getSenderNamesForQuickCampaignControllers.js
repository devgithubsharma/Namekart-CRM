const dbConnection = require('../dbConnection');

const getSenderNamesForQuickCampaign = async (req,res) =>{
    const userId = req.params.userId
    // const senderIds = req.query.ids
    console.log("userId",userId)
    let connection;
   

    try{
        connection = await dbConnection.getConnection();
         // Create placeholders for query
        const query = `SELECT sender_name FROM sendertable WHERE user_id = ?`;
        
        await connection.query(query,[userId],(error,result)=>{
            if(error){
                console.log('Error in getting sender emails query', error)
                res.status(500).send('Error in fetching sender emails');
            }else{
                console.log("response",result)
                res.status(201).json({result})
            }
        })
    }catch(err){
        console.error("Error in fetching Senders names Data", err);
        res.status(500).send("Error in fetching Senders email Data");

    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    getSenderNamesForQuickCampaign
}