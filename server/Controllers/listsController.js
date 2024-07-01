const dbConnection = require('../dbConnection'); 

const createList = async (req, res) => {
  let connection;
    try {
      const  list_title  = req.body.title;
      const userId = req.body.userId
      console.log("list_title",list_title)
      connection = await dbConnection.getConnection();
      const insertQuery = 'INSERT INTO titledata (title,userId) VALUES (?,?)';
      console.log("userId",userId)
      // Execute the query
     await connection.query(insertQuery, [list_title,userId], (err,result) =>{
        if(err){
            console.log(err); 
            res.status(500).json({ error: 'Internal Server Error' }); 
        }else{ 
            console.log('List result', result); 
            res.status(201).json({ 
              title: { title_id: result.insertId }, 
            });
        }
     });
    } catch (error) {
      console.error('Error creating list:', error.message);

     
      res.status(500).json({ error: 'Internal Server Error' }); 
    }finally{
      if(connection){
        connection.release(); 
      }
    }
  };
  
  module.exports = {
    createList, 
    // Add other CRUD operations as needed 
  };
