const dbConnection = require('../dbConnection'); 

const getContactsLists = async (req,res) =>{
    // const listsId = req.params.listsDataId;
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT emails from listsdata';
        await connection.query(query,(error,result)=>{
            if(error){
                console.log('Error in get contact list query',error)
            }else{
                connection.release();
                res.status(201).json({result})
            }
        })

    }catch(err){
        if(connection){
            connection.release()
        }
        res.status(500).send("Error in fetching Contact lists");
    }
}

module.exports = {
    getContactsLists,
}