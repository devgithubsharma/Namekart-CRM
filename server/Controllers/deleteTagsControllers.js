const dbConnection = require('../dbConnection');

const deleteTags = async (req,res) =>{
    const tagId = req.params.tagToDelete;
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query = 'DELETE FROM tagsdata WHERE tags_id = ?'

        await connection.query(query,[tagId],(error,result)=>{
            if(error){
                console.log('Error in Email deletion', error)
                res.status(500).json({ error: 'Internal Server Error' });
            }else{
                connection.release();
                res.status(200).json({ message: 'Tag Deleted successfully'});
            }
        })

    }catch(err){
        console.error('Error in deletion of tags', err.message)
        if(connection){
            connection.release()
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    deleteTags,
}