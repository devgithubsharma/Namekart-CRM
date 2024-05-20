const dbConnection = require('../dbConnection');

const fetchTags = async (req,res) =>{
    let connection;
    try {
        connection = await dbConnection.getConnection();
        const query = "SELECT title_id, tags FROM tagsdata";

        await connection.query(query, (err,result)=>{
            
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
                connection.release();
                const tags = result.map(row => ({ title_id: row.title_id, tag: row.tags }));
                res.status(201).json({result})
            }
        })
    } catch (error) {
        if(connection){
            connection.release();
        }
        res.status(500).send("Error fetching tags");
    }
}


module.exports = {
    fetchTags,
}