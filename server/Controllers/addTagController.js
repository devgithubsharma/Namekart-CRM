const dbConnection = require('../dbConnection');

function checkTagAndReturnTitleId(tag, userId, connection) {
  return new Promise(async (resolve, reject) => {
    try {
      const tagExistsQuery = 'SELECT * FROM tagsdata WHERE tags = ? AND userId = ?';
      await connection.query(tagExistsQuery, [tag, userId], (err, result) => {
        if (err) {
          console.log("Error in checkTagAndReturnTitleId query", err)
        } else {
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

const addTag = async (req, res) => {
  const { titleId, tag, userId } = req.body;
  let connection;
  try {
    connection = await dbConnection.getConnection();

    // Check if the tag already exists for the user
    const query = 'SELECT tags_id FROM tagsdata WHERE tags = ? AND userId = ?';
    connection.query(query, [tag, userId], (error, tagResult) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      let tagId;
      if (tagResult.length > 0) {
        // Tag already exists
        tagId = tagResult[0].tags_id;
        console.log(tagId);
        checkAndInsertRelationship(tagId);
      } else {
        // Insert new tag
        const insertQuery = 'INSERT INTO tagsdata (tags, userId) VALUES (?, ?)';
        connection.query(insertQuery, [tag, userId], (insertError, insertResult) => {
          if (insertError) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          tagId = insertResult.insertId;
          checkAndInsertRelationship(tagId);
        });
      }
    });

    const checkAndInsertRelationship = (tagId) => {
      // Check if the relationship between title and tag already exists
      const relationshipQuery = 'SELECT * FROM titles_tags WHERE title_id = ? AND tags_id = ?';
      connection.query(relationshipQuery, [titleId, tagId], (relationshipError, relationshipResult) => {
        if (relationshipError) {
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        if (relationshipResult.length > 0) {
          res.status(200).json({ message: 'Tag already associated with this title' });
        } else {
          // Insert new relationship between title and tag
          const insertRelationshipQuery = 'INSERT INTO titles_tags (title_id, tags_id) VALUES (?, ?)';
          connection.query(insertRelationshipQuery, [titleId, tagId], (insertRelationshipError) => {
            if (insertRelationshipError) {
              console.error('Error inserting relationship:', insertRelationshipError);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
            res.status(200).json({ message: 'Tag associated with title successfully', tagId });
          });
        }
      });
    };

  } catch (err) {
    console.error('Error in creating tag or associating it with title', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  addTag,
};
