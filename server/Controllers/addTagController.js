const dbConnection = require('../dbConnection'); 

function checkTagAndReturnTitleId(tag, userId, connection) {
  return new Promise(async (resolve, reject) => {
      try {
          const tagExistsQuery = 'SELECT * FROM tagsdata WHERE tags = ? AND userId = ?';
          await connection.query(tagExistsQuery, [tag, userId], (err,result)=>{
              if(err){
                  console.log("Error in checkTagAndReturnTitleId query",err)
              }else{
                  if (result.length > 0) {
                      resolve(result[0].title_id); 
                  } else {
                      resolve(null); 
                  }
              }
              
          })
          
      } catch (error) {
          console.error('Error checking tag:', error);
          reject(error);
      }
  });
}

const addTag =  async (req, res) => {
  console.log(req)
    const titleId = req.body.titleId;
    const tags = req.body.tag;
    const userId = req.body.userId
    let connection; 

    try {
      connection = await dbConnection.getConnection();
      const existingTitleId = await checkTagAndReturnTitleId(tags,userId,connection);
      if(existingTitleId){
        res.status(200).json({ message: 'Tag already exist' });
      }else{
        const query = 'INSERT into tagsdata (title_id, tags, userId) VALUES (?, ?, ?)';
        await connection.query(query,[titleId,tags,userId],(error,result)=>{
          if(error){
              console.log('Error in tagsdata query', error)
              res.status(500).json({ error: 'Internal Server Error' });
          }else{
              
              res.status(200).json({ message: 'Email created successfully',tagIds: result.insertId });
          }
      })
      }
     
    } catch (err) {
      console.error('Error in creating tags Table', err.message)
      res.status(500).json({ err: 'Internal Server Error' });
    }finally{
      if(connection){
        connection.release();
      }
    }
  };
  
 module.exports = {
    addTag,
    
  };
