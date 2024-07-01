const dbConnection = require('../dbConnection');

const getSendersEmailsDetail = async (req,res) =>{
    const userId = req.params.userId
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = 'Select * from sendertable where user_id=?';
        await connection.query(query,[userId],(error,result) => {
            if(error){
                console.log('Error in getting sender emails query', error)
                res.status(500).send('Error in fetching sender emails');
            }else{
                
                res.status(201).json({result})
            }
        })
    }catch(err){
        
        res.status(500).send("Error in fetching Senders email Data");

    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    getSendersEmailsDetail
}