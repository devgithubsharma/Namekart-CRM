const dbConnection = require("../dbConnection");

const fetchContactsForTags = async (req, res) => {
  const tags_id = req.params.tags_id;

  let connection;
  try {
    connection = await dbConnection.getConnection();
    const query = `
        SELECT listsdata.emails FROM listsdata 
        INNER JOIN titledata ON listsdata.title_id = titledata.title_id
        INNER JOIN titles_tags ON titledata.title_id = titles_tags.title_id
        INNER JOIN tagsdata ON titles_tags.tags_id = tagsdata.tags_id
        WHERE tagsdata.tags_id = ?;
    `;

    await connection.query(query, [tags_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log("result", result);
        const results = result.map((row) => ({ emails: row.emails }));
        res.status(201).json({ results });
      }
    });
  } catch (error) {
    res.status(500).send("Error fetchContactsForTags");
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  fetchContactsForTags,
};
