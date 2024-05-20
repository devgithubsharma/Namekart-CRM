const dbConnection = require('../dbConnection'); 

const updateUnsubscribePage = async (req,res) =>{
    const campId = req.params.campId;
    const messageId = req.params.mailId;

    console.log(campId,messageId)

    try{
        const connection = await dbConnection.getConnection();
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
    }
}

module.exports = {
    updateUnsubscribePage,
}
