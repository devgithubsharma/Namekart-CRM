const dbConnection = require('../dbConnection');

const updateEmail = async (req, res) => {
  const { email, name, refreshToken, userId } = req.body;
  const sender_id = req.params.sender_id;
  let connection;

  try {
    connection = await dbConnection.getConnection();
    const query = 'UPDATE sendertable SET sender_email_id = ?, sender_name = ?, refreshToken = ? WHERE sender_id = ? AND user_id = ?';

    await connection.query(query, [email, name, refreshToken, sender_id, userId], (error, result) => {
      if (error) {
        console.log('Error in sendertable update query', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json({ message: 'Email updated successfully' });
      }
    });

  } catch (err) {
    console.error('Error in updating Sender Table', err.message);
    if (connection) {
      connection.release();
    }
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  updateEmail,
};
