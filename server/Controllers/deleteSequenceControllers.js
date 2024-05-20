const dbConnection = require('../dbConnection'); 

const deleteSequence = async (req,res) =>{
    const seqId = req.params.id;
    let connection;

    try {
        connection = await dbConnection.getConnection();
        await connection.beginTransaction();
    
        try {
          await connection.query('DELETE FROM steps WHERE sequenceId = ?', [seqId]);
    
          await connection.query('DELETE FROM sequences WHERE sequence_id = ?', [seqId]);
    
          await connection.commit();
          connection.release();
    
          res.status(200).send({ message: 'Sequence and associated steps deleted successfully.' });
        } catch (error) {

          await connection.rollback();
          connection.release();
          throw error;
        }
      } catch (error) {
        console.error('Failed to delete sequence and associated steps:', error);
        if(connection){
          connection.release();
        }
        res.status(500).send({ message: 'Failed to delete sequence and associated steps.' });
      }
    
}

module.exports = {
    deleteSequence,
}