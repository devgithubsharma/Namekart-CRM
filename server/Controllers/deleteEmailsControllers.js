const dbConnection = require('../dbConnection');

const deleteEmails = async (req,res) =>{
    const senderId = req.params.emailToDelete;
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = 'DELETE FROM sendertable WHERE sender_id = ?'

        await connection.query(query,[senderId],(error,result)=>{
            if(error){
                console.log('Error in Email deletion', error)
                res.status(500).json({ error: 'Internal Server Error' });
            }else{
                connection.release();
                res.status(200).json({ message: 'Email Deleted successfully'});
            }
        })

    }catch(err){
        console.error('Error in deletion of emails', err.message)
        if(connection){
            connection.release();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    deleteEmails,
}