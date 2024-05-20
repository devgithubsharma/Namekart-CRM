const dbConnection = require('../dbConnection'); 

const addTag =  async (req, res) => {
  console.log(req)
    const titleId = req.body.titleId;
    const tags = req.body.tag;
    let connection; 

    try {
      connection = await dbConnection.getConnection();
      const query = 'INSERT into tagsdata (title_id, tags) VALUES (?, ?)';
      await connection.query(query,[titleId,tags],(error,result)=>{
        if(error){
            console.log('Error in tagsdata query', error)
            res.status(500).json({ error: 'Internal Server Error' });
        }else{
            connection.release();
            res.status(200).json({ message: 'Email created successfully',tagIds: result.insertId });
        }
    })
    } catch (err) {
      console.error('Error in creating tags Table', err.message)
      if(connection){
        connection.release();
      }
      res.status(500).json({ err: 'Internal Server Error' });
    }
  };
  
 module.exports = {
    addTag,
    
  };
