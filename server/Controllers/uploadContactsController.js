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

const uploadContacts = async (req,res)=>{
    const titleId = req.body.titleId;
    const csvColumns = req.body.csvColumns;
    const csvData = req.body.csvValues;
    const userId = req.body.userId
    const tags = req.body.tag

    console.log("csvData",csvData)
    console.log("csvColumns",csvColumns)
    console.log("titleId",titleId)
    console.log("tags",tags)
    

    const csvValues = csvData.map(row => Object.values(row).map(cell => cell.trim()));
    const cleanedCsvColumns = Object.keys(csvColumns).map(key => key.replace(/\r/g, ''));
    const cleanedCsvValues = csvValues.map(row => row.map(cell => cell.replace(/\r/g, '')));

    let connection 
    try{
     connection = await dbConnection.getConnection();
     const existingTitleId = await checkTagAndReturnTitleId(tags,userId,connection);
     let title_Id;
        console.log("existingTitleId",existingTitleId)

     if(existingTitleId){
        title_Id = existingTitleId;
     }else{
        title_Id = titleId
     }
     console.log('title_Id',title_Id)

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
    const columnNames = ['title_id', 'userId', ...dbColumns].join(', ');
    const placeholders = cleanedCsvValues.map(row => `(${new Array(row.length + 2).fill('?').join(', ')})`).join(', ');


    // Assuming you have a 'listdata' table with columns: list_id, domain, lead, name, email
    const query = `INSERT INTO listsdata (${columnNames}) VALUES ${placeholders}`;
    console.log(query);

    const flatValues = cleanedCsvValues.reduce((acc, row) => [...acc, title_Id, userId, ...row], []);
    await connection.query(query, flatValues, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        return res.json({ message: 'Contacts uploaded successfully', listDataId: result.insertId });
    });
   
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }finally{
        if(connection){
            connection.release();
        }
    }

}

module.exports = {
    uploadContacts,
  };
