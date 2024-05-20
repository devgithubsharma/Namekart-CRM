const dbConnection = require('../dbConnection'); 

const getCampIdUsingEmailKeyId = async (req,res) =>{
    const emailId = req.params.email_id;
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const getCampIdQuery = 'SELECT threadId FROM emailsdata WHERE email_id = ?';
        connection.query(getCampIdQuery, [emailId], (err, results) => {
        if (err) {
            console.error('Error fetching chat data:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
    }catch(err){
        console.log("Internal server error",err)
    }finally{
        if (connection) {
            connection.release(); 
        }
    }
     
}

module.exports = {
    getCampIdUsingEmailKeyId,
}