const dbConnection = require('../dbConnection');


const fetchTags = async (req, res) => {
    const userId = req.params.userId;
    let connection;

    try {
        connection = await dbConnection.getConnection();

        const query = `
            SELECT tagsdata.tags_id, tagsdata.tags, GROUP_CONCAT(titledata.title_id) AS title_ids
            FROM tagsdata
            INNER JOIN titles_tags ON tagsdata.tags_id = titles_tags.tags_id
            INNER JOIN titledata ON titles_tags.title_id = titledata.title_id
            WHERE tagsdata.userId = ?
            GROUP BY tagsdata.tags_id, tagsdata.tags
        `;

        await connection.query(query, [userId], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                // Transform the result to match the desired format
                const formattedResult = result.map(row => ({
                    tags_id: row.tags_id,
                    tags: row.tags,
                    title_ids: row.title_ids.split(',').map(Number) // Convert title_ids string to array of integers
                }));

                res.status(200).json({ result: formattedResult });
            }
        });

    } catch (error) {
        console.error('Error fetching tags', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    fetchTags,
}