const dbConnection = require('../dbConnection');

const fetchTags = async (req,res) =>{
    const userId = req.params.userId
    let connection;
    try {
        connection = await dbConnection.getConnection();
        const query = "SELECT title_id, tags FROM tagsdata where userId=?";

        await connection.query(query,[userId], (err,result)=>{
            
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
                
                const tags = result.map(row => ({ title_id: row.title_id, tag: row.tags }));
                res.status(201).json({result})
            }
        })
    } catch (error) {
        
        res.status(500).send("Error fetching tags");
    }finally{
        if(connection){
            connection.release();
        }
    }
}


module.exports = {
    fetchTags,
}