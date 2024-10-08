const dbConnection = require('../dbConnection');

const updateEmails = async (req,res) =>{
    const emailId = req.body.emailId
    const token = req.body.accessToken
    let connection
    try{
        console.log('updateEmails')
        connection = await dbConnection.getConnection();
        const query = 'UPDATE sendertable SET refreshToken = ? WHERE sender_id = ?';

        connection.query(query, [token, emailId], (err, result) => {
            if (err) {
              return res.status(500).send({ message: 'Error updating token', error: err });
            }
            res.send({ message: 'Token updated successfully', result });
        })
    }catch(err){
        console.log(err)
        res.status(500).send("Error during the Update emails process.");
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    updateEmails,
}

