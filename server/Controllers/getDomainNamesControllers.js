const dbConnection = require('../dbConnection');

const getDomainNames = async (req, res) => {
    const tags_id = req.params.tags_id;
    const userId = req.params.userId
    let connection;

    try {
        connection = await dbConnection.getConnection();

        const query = `
        SELECT listsdata.domains FROM listsdata 
        INNER JOIN titledata ON listsdata.title_id = titledata.title_id
        INNER JOIN titles_tags ON titledata.title_id = titles_tags.title_id
        INNER JOIN tagsdata ON titles_tags.tags_id = tagsdata.tags_id
        WHERE tagsdata.tags_id = ? AND tagsdata.userId = ?;
    `;

        await connection.query(query, [tags_id, userId], (err, result) => {
            if (err) {
                res.status(500).send('Error fetching domains');
            } else {
                connection.release();
                res.json({ domains: result.map(row => row.domains) });
            }
        })
    } catch (err) {
        console.error('Error in getting domains by listId Controllers', err.message)
        if (connection) {
            connection.release();
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getDomainNames,
}