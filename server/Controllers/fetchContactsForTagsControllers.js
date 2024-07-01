const dbConnection = require('../dbConnection');

const fetchContactsForTags = async (req,res) =>{
    const titleId = req.params.titleId
    console.log("titleId",titleId)
    
    let connection;
    try {
        connection = await dbConnection.getConnection();
        const query = "SELECT emails FROM listsdata where title_id=?";

        await connection.query(query,[titleId], (err,result)=>{
            
            if(err){
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'})
            }else{
                console.log("result",result)
                const results = result.map(row => ({ emails: row.emails }));
                res.status(201).json({results})
            }
        })
    } catch (error) {
        
        res.status(500).send("Error fetchContactsForTags");
    }finally{
        if(connection){
            connection.release();
        }
    }
}


module.exports = {
    fetchContactsForTags,
}