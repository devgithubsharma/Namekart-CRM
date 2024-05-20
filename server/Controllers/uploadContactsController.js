const dbConnection = require('../dbConnection'); 

const uploadContacts = async (req,res)=>{
    const titleId = req.body.titleId;
    const csvColumns = req.body.csvColumns;
    const csvData = req.body.csvValues;

    console.log(csvData)

    const csvValues = csvData.map(row => Object.values(row).map(cell => cell.trim()));
    const cleanedCsvColumns = Object.keys(csvColumns).map(key => key.replace(/\r/g, ''));
    const cleanedCsvValues = csvValues.map(row => row.map(cell => cell.replace(/\r/g, '')));


    try{
    const connection = await dbConnection.getConnection();

    const mapColumns = (csvColumns) => {
        const columnMap = {
            'domain': 'domains',
            'lead': 'leads',
            'name': 'names',
            'email': 'emails',
            'links': 'links'
        };

        const lowercaseColumns = csvColumns.map(column => column.toLowerCase().trim());
        return lowercaseColumns.map(column => columnMap[column]).filter(Boolean);
    };

    const isValidData = cleanedCsvValues.every(row => row.length === cleanedCsvColumns.length);

    if (!isValidData) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    const dbColumns = mapColumns(cleanedCsvColumns);

    // Assuming you have a 'listdata' table with columns: list_id, domain, lead, name, email
    const query = `INSERT INTO listsdata (title_id, ${dbColumns.join(', ')}) VALUES ?`;
    // console.log(query)

    await connection.query(query, [cleanedCsvValues.map(row => [titleId, ...row])],
    (err,result) =>{
        connection.release();

        if(err){
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // if (result.affectedRows === 0) {
        //     return res.status(404).json({ message: 'List not found' });
        // }
        return res.json({ message: 'Contacts uploaded successfully',listDataId: result.insertId });
    }
    );
   
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

module.exports = {
    uploadContacts,
  };
