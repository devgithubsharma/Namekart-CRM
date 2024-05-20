const dbConnection = require('../dbConnection');

const updateDomainStatus = async (req,res) =>{
    const campId = req.params.campId;
    const messageId = req.params.mailId;
    console.log('campId',campId)
    console.log('messageId',messageId)

    try{
        const connection = await dbConnection.getConnection();
        const insertEmailQuery = 'UPDATE emailsdata SET contactsClicked=? WHERE campId = ? and messageId = ?'
        await connection.query(insertEmailQuery,['yes', campId, messageId],(err,result)=>{
            if(err){
                console.log('Error in insertEmailQuery',err)
            }else{
                console.log(result)
                connection.release();
                console.log(`Update successful for messageId: ${messageId}`)
                res.json({result})
            }
        })
    }catch(err){
        console.log(err);
        res.status(500).send('Server error occurred');
    }
}

module.exports = {
    updateDomainStatus,
}