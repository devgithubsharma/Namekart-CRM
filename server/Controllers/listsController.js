const dbConnection = require('../dbConnection'); 

const createList = async (req, res) => {
  let connection;
    try {
      const  list_title  = req.body.title;
      connection = await dbConnection.getConnection();

      // Use a raw SQL query to insert a new list into the 'lists' table
      const insertQuery = 'INSERT INTO titledata (title) VALUES (?)';
  
      // Execute the query
     await connection.query(insertQuery, [list_title], (err,result) =>{
        if(err){
            console.log(err); 
            res.status(500).json({ error: 'Internal Server Error' }); 
        }else{ 
            console.log('List result', result); 
                // Release the connection back to the pool 
            connection.release(); 
            res.status(201).json({ 
              title: { title_id: result.insertId }, 
            });
        }
     });
    } catch (error) {
      console.error('Error creating list:', error.message);

      if(connection){
        connection.release(); 
      }
      res.status(500).json({ error: 'Internal Server Error' }); 
    }
  };
  
  module.exports = {
    createList, 
    // Add other CRUD operations as needed 
  };
