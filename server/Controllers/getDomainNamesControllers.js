const dbConnection = require('../dbConnection');

const getDomainNames = async (req,res) =>{
    const titleId = req.params.titleId
    let connection;

    try{
       connection = await dbConnection.getConnection();
        const query = "SELECT domains FROM listsdata WHERE title_id  = ?"

        await connection.query(query,[titleId],(err,result)=>{
            if(err){
                console.error('Error in fetching domains:', err);
                res.status(500).send('Error fetching domains');
            }else{
                connection.release();
                res.json({ domains: result.map(row => row.domains) });
            }
        })
    }catch(err){
        console.error('Error in getting domains by listId Controllers', err.message)
        if(connection){
            connection.release();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getDomainNames,
}