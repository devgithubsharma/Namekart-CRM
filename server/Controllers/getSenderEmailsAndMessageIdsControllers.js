const dbConnection = require('../dbConnection'); 

const getSenderEmailsAndMessageIds = async (req,res) =>{
    const campId = req.query.CampId
    console.log('CampId',campId)
    console.log('getSenderEmailsAndMessageIds working');
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const insertEmailQuery = 'SELECT sender_email,messageId FROM emailsdata WHERE campId=? ';
        connection.query(insertEmailQuery,[campId],(err,result)=>{
            if(err){
                console.log('Error in getSenderEmailsAndMessageIds query',err)
            }else{
                const plainResult = JSON.parse(JSON.stringify(result));
                console.log('plainResult',plainResult)
                res.json(plainResult);
            }
        });
    }catch(err){
        console.error('Error in getSenderEmailsAndMessageIds', err);
        
        res.status(500).send({ error: 'Internal Server Error' });
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    getSenderEmailsAndMessageIds,
}
