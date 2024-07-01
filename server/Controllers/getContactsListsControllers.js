const dbConnection = require('../dbConnection'); 

const getContactsLists = async (req,res) =>{
    const userId = req.params.userId
    
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT emails from listsdata where userId=?';
        await connection.query(query,[userId],(error,result)=>{
            if(error){
                console.log('Error in get contact list query',error)
            }else{
                res.status(201).json({result})
            }
        })

    }catch(err){
        res.status(500).send("Error in fetching Contact lists");
    }finally{
        if(connection){
            connection.release()
        }
    }
}

module.exports = {
    getContactsLists,
}