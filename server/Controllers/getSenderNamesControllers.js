const dbConnection = require('../dbConnection');

const getSendersNames = async (req,res) =>{
    const userId = req.params.userId
    const senderIds = req.query.ids
    console.log("userId",userId)
    console.log("senderIds", senderIds);
    let connection;
    if (!senderIds) {
        res.status(400).send("No sender IDs provided");
        return;
    }

    const idsArray = senderIds.includes(',') ? senderIds.split(',').map(id => id.trim()) : [senderIds.trim()];
    console.log("idsArray", idsArray);
    if (idsArray.length === 0) {
        res.status(400).send("Invalid sender IDs provided");
        return;
    }

    try{
        connection = await dbConnection.getConnection();
        const placeholders = idsArray.map(() => '?').join(', '); // Create placeholders for query
        const query = `SELECT sender_name FROM sendertable WHERE user_id = ? AND sender_email_id IN (${placeholders}) ORDER BY FIELD(sender_email_id, ${placeholders})`;
        const queryValues = [userId, ...idsArray, ...idsArray]; // Duplicate idsArray for FIELD function
        await connection.query(query,queryValues,(error,result)=>{
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
    getSendersNames
}