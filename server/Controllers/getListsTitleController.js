const dbConnection = require('../dbConnection'); 

const getListsTitle = async (req,res) =>{
    const userId = req.params.userId
    let connection;

    
    try{
        connection = await dbConnection.getConnection();
        const query = 'SELECT title from titledata where userId=?';
        connection.query(query,[userId],(error,result) =>{
            if(error){
                console.log('Error in fetching list title query')
                res.status(500).send('Error fetching emails');
            }else{
                
                res.status(201).json({result})
            }
        })

    }catch(err){
        res.status(500).send("Error in fetching list title ");
    }finally{
        if(connection){
            connection.release();
        }
    }
}


module.exports = {
    getListsTitle,
}