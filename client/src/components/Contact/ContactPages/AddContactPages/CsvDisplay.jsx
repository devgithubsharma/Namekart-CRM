import React, { useEffect, useState, useContext } from 'react';
import '../../../../style/CsvDisplay.css'
import { useNavigate } from 'react-router-dom';
import axios from'axios';
import { useTagContext } from '../../../ContextApi/TagContext';
import { Box, TextField, Chip, Button, Typography  } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
import { GlobalContext } from '../../../ContextApi/GlobalContext';
import { uploadContacts } from '../../../../api';
import { saveTags } from '../../../../api';
import { deleteTag } from '../../../../api';


function CsvDisplay({ csvData, listTitle, titleId}) { 
  const {data,fileName: csvActualFileName} = csvData;
  const [csvFileName, setCsvFileName] = useState(csvActualFileName || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [proceedClicked, setProceedClicked] = useState(false);
  const [temporaryTag, setTemporaryTag] = useState('');
  // const {setTagUpdated} = useTagContext();
  const navigate = useNavigate();
  const { userId } = useContext(GlobalContext);

  const handleProceedClick = () => {
    setProceedClicked(true);
    // onProceed();
  };

  const handleTagChange = (event) => {
    setTemporaryTag(event.target.value);  // Update temporary tag simultaneously
    setTagInput(event.target.value);
};
     
  console.log(data)

  useEffect(()=>{
    console.log("data",data)
  },[data])
  const handleUploadContacts = async () => {
    try {  
      // Upload contacts
      // const uploadResponse = await axios.post('https://crmapi.namekart.com/api/listsData/uploadContacts', {
      //   titleId: titleId,
      //   csvColumns: data[0],     
      //   csvValues: data,   
      //   userId: userId
      // });
      const uploadResponse = await uploadContacts(titleId,userId,data,temporaryTag)
      console.log('Upload Contacts response', uploadResponse);
      
      navigate('/home/contacts', { state: {id:titleId} });
    } catch (err) {
      console.log('Upload Contacts error', err.message);
    }
  };
      

  const handleAddTag = async () => {
      try {   
        if(tagInput){      
        // const response = await axios.post('https://crmapi.namekart.com/api/lists/addTag', {
        //   titleId:titleId,
        //   tag: tagInput,
        //   userId:userId
        // });  
        const response = await saveTags(titleId,tagInput,userId)
        console.log("response - ",response);
        if(response.data.message!=="Tag already exist"){
          console.log('Tag Id', response.data);
          const newTags = { id: response.data.tagIds, tag: tagInput };
          setTags([...tags,newTags]);
          setTagInput('');  
        }else{
          const newTags = { tag: tagInput };
          setTags([...tags,newTags]);
          setTagInput(''); 
        }
        
    }
      } catch (error) { 
        console.error('Error adding tag:', error.message);        
      }   
  };   

  const handleDeleteTag = (tagToDelete) => () => {
    setTags((tags) => tags.filter((tagObject) => tagObject.id !== tagToDelete));
    deleteTag(tagToDelete)
    .then(response => {
        console.log('Email deleted:', response.data);
    })                
    .catch(error => {
        console.error('Failed to delete email:', error);
    });
};

  return (
    <div className='csv-display-container'>
      <div className='csv-table-container'>
      <table>      
        <thead>
          <tr>
            {Object.keys(data[0]).map((header, index) => (
              <th key={index}>{header}</th>
            ))}   
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}  
            </tr>
          ))}
        </tbody>
      </table>  
      </div>
       
      {!proceedClicked && (
        <div className='proceed-button-container'>
          <button onClick={handleProceedClick}>Proceed</button>
        </div>
      )}

      {proceedClicked && (
        <div className='options-section'>
          <h2>Options</h2>
  
          <div className='option-1'>
            {/* <label>CSV File Name:</label> */}
            {/* <input
              type='text'
              value={csvFileName}
              onChange={(e) => setCsvFileName(e.target.value)}
            /> */}

            <Box sx={{mx:1}}>
                <TextField 
                    value={csvFileName}
                    variant="outlined"
                    InputProps={{
                      style: {
                          marginBottom:'14px', width: '590px',borderRadius:'14px',
                          marginRight:'30px'
                      }
                  }}  
                />
            </Box>
          </div>

          <div className='option-2'>
            {/* <label>Add Tags:</label>
            <input
              type='text'
              value={tagInput}
              placeholder='Add tags'
              onChange={(e) => setTagInput(e.target.value)}
            />
            <button onClick={handleAddTag}>Add</button> */}

            <Box sx={{ m: 1 }}>
              <TextField
                  label="Add Tags"
                  value={tagInput}
                  onChange={handleTagChange}
                  variant="outlined"
                  InputProps={{
                      style: {
                          marginBottom:'14px', width: '590px',borderRadius:'14px',
                          marginRight:'30px'
                      }
                  }}   
              />
              <Button 
                  variant="contained" 
                  onClick={handleAddTag}
                  // disabled={!isValidEmail(tagInput)}
              >
                  Add Tags
              </Button>

              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((tagObject) => (
                    <Chip
                        key={tagObject.id}
                        label={tagObject.tag}
                        onDelete={handleDeleteTag(tagObject.id)}
                        color="primary"
              />
                ))}
                
              </Box>
            </Box>
          </div>
        </div>   
      )}     
      {proceedClicked && ( 
        <div className='upload-button-container'>
          <button onClick={handleUploadContacts}>Upload Contacts</button>
        </div>
      )}  
    </div>
  );
}

export default CsvDisplay;
