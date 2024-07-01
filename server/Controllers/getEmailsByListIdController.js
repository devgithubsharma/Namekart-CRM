const dbConnection = require('../dbConnection');

const getEmailsById = async (req,res) =>{
    const titleId = req.params.titleId;
    const userId = req.params.userId
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = "SELECT * FROM listsdata WHERE title_id  = ? AND userId=?"

        connection.query(query,[titleId,userId],(err,result)=>{
            if(err){
                console.error('Error fetching emails:', err);
                res.status(500).send('Error fetching emails');
            }else{
               console.log("result",result)
                res.json({ emails: result.map(row => row.emails), domains: result.map(row => row.domains), leads: result.map(row => row.leads), names: result.map(row => row.names), links: result.map(row => row.links)});
            }
        })
    }catch(err){
        console.error('Error in getting Emails by listId Controllers', err.message)
        
        res.status(500).json({ error: 'Internal Server Error' });
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    getEmailsById,
}
