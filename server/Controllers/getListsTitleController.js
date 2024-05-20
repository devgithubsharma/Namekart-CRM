const dbConnection = require('../dbConnection'); 

const getListsTitle = async (req,res) =>{
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT title from titledata';
        await connection.query(query,(error,result) =>{
            if(error){
                console.log('Error in fetching list title query')
                res.status(500).send('Error fetching emails');
            }else{
                connection.release();
                res.status(201).json({result})
            }
        })
    }catch(err){
        if(connection){
            connection.release();
        }
        res.status(500).send("Error in fetching list title ");
    }
}

module.exports = {
    getListsTitle,
}