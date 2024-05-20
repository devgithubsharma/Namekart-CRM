const dbConnection = require('../dbConnection');

const getEmailsById = async (req,res) =>{
    const titleId = req.params.titleId;
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = "SELECT * FROM listsdata WHERE title_id  = ?"

        await connection.query(query,[titleId],(err,result)=>{
            if(err){
                console.error('Error fetching emails:', err);
                res.status(500).send('Error fetching emails');
            }else{
                
                connection.release();
                res.json({ emails: result.map(row => row.emails), domains: result.map(row => row.domains), leads: result.map(row => row.leads), names: result.map(row => row.names), links: result.map(row => row.links)});
            }
        })
    }catch(err){
        console.error('Error in getting Emails by listId Controllers', err.message)
        if(connection){
            connection.release();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getEmailsById,
}
