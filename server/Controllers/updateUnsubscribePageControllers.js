const dbConnection = require('../dbConnection'); 

const updateUnsubscribePage = async (req,res) =>{
    const campId = req.params.campId;
    const messageId = req.params.mailId.replace(/^<|>$/g, '');

    console.log(campId,messageId)
    let connection
    try{
         connection = await dbConnection.getConnection();
        const insertEmailQuery = 'UPDATE emailsdata SET contactsUnsubscribed = ? WHERE campId = ? AND messageId = ?'

        await connection.query(insertEmailQuery,['yes',campId,messageId], (err,result)=>{
            if(err){
                console.log('Error in updateUnsubscribePage query',err)
            }else{
                console.log('result of updateUnsubscribePage hit',result)
                res.json({result})
            }
        })
    
    }catch(err){
        console.log(err)
        res.status(500).send("Error during the Update Unsubscribe page process.")
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    updateUnsubscribePage,
}
