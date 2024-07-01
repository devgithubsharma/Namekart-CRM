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
                
                res.json({result});
            }
        })
    }catch(err){
        console.log('Error in getSequenceNames',err)
       
        res.status(500).send('Error in getSequenceNames')
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {
    getSequenceNames,
}