const dbConnection = require('../dbConnection'); 

const getIndexData = async (req,res) =>{
    const { type } = req.query;
    console.log(type)
    const emailType = "received"
    let connection;
    try{
        let query = "";
        let queryParams = [];
        connection = await dbConnection.getConnection();

        if (type === 'All') {
            query = "SELECT * FROM emailsdata WHERE emailType = ?";
            queryParams = [emailType];
        } else {
            query = `
                SELECT e.email_id, e.receiver_email, e.subject, e.emailBody, e.receivedTime FROM emailsdata e
                JOIN camptable c ON e.campId = c.camp_id
                WHERE c.camp_type = ? AND e.emailType = ?
            `;
            queryParams = [type, emailType];
        }

        connection.query(query, queryParams, (err,result) =>{
            if(err){
                console.log('Error in getIndexData',err)
            }else{
                console.log('result',result)
                res.json({result});

            }
        }); 
        
    }catch(err){
        res.status(500).send('Internal Server error');
    }finally{
        if (connection) {
            connection.release(); 
        }
    }
}


module.exports = {
    getIndexData,
}