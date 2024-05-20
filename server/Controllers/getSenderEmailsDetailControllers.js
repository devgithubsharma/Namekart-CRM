const dbConnection = require('../dbConnection');

const getSendersEmailsDetail = async (req,res) =>{
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = 'Select * from sendertable';
        await connection.query(query,(error,result)=>{
            if(error){
                console.log('Error in getting sender emails query', error)
                res.status(500).send('Error in fetching sender emails');
            }else{
                connection.release();
                res.status(201).json({result})
            }
        })
    }catch(err){
        if(connection){
            connection.release();
        }
        res.status(500).send("Error in fetching Senders email Data");

    }
}

module.exports = {
    getSendersEmailsDetail
}