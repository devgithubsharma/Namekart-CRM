const dbConnection = require('../dbConnection'); 

const getSequenceNames = async (req,res) =>{
    const campId = req.params.campId;
    let connection
    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT sequence_name FROM sequences WHERE campaign_id = ?'

        await connection.query(query,[campId], (err,result) =>{
            if(err){
                console.log('Error in getSequenceNames query', err)
            }else{
                connection.release();
                res.json({result});
            }
        })
    }catch(err){
        console.log('Error in getSequenceNames',err)
        if(connection){
            connection.release();
        }
        res.status(500).send('Error in getSequenceNames')
    }
}

module.exports = {
    getSequenceNames,
}