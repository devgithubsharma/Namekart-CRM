import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../../style/CreateContacts.css';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import { getToken } from '../../../IndexedDB/IdbFunctions';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { GlobalContext } from '../../../ContextApi/GlobalContext';
import {saveTitle} from '../../../../api'
import {fetchListsTitle} from '../../../../api'
       
function CreateContacts() {            
  const navigate = useNavigate();        
  const [listTitle, setListTitle] = useState('');
  const [showCreateListBox, setShowCreateListBox] = useState(false);
  // const [userId, setUserId] = useState(null);
  const [listsNames, setListsNames] = useState([]);
  const { userId } = useContext(GlobalContext);

//   useEffect(() => {         
//     const fetchToken = async () => {       
//         const token = await getToken();      
//         if (token) {      
//             const decodedToken = jwtDecode(token);
//             setUserId(decodedToken.id); 
//         } 
//     };        
//     fetchToken();           
// }, []);         


 useEffect(()=>{
   const fetchListTitle = async () =>{
    try{
      // const response = await axios.get(`https://crmapi.namekart.com/api/getListTitle/${userId}`);
      // console.log(response.data)
      const response = await fetchListsTitle(userId)
      setListsNames(response.data.result)

    }catch(err){
      console.log('Error in fetching lists title', err)
    }
   }
   fetchListTitle()
 },[])

              
  const handleBackToContacts = () => {
    navigate(-1)      
  };    
             
  const handleCreateNewList = () => {
    setShowCreateListBox(true);  
  }; 
    
  const handleContinue = async () => {
    try{
      // console.log('Creating a new list with title:', listTitle);
      // const response = await axios.post('https://crmapi.namekart.com/api/createTitle', { title: listTitle,userId:userId });
      
      const response = await saveTitle(listTitle,userId);
      const titleId = response.data.title.title_id
      setShowCreateListBox(false);
      navigate('/home/uploadContacts',{ state :{ 
        listTitle,
        titleId: titleId,
        userId: userId

      } });   
    }catch(err){  
      console.log('Handle Continue error', err)
    }       
  };   

  

  const handleCancel = () => {
    setShowCreateListBox(false);   
  };   
  
  const handleButtonClick = (id) => {
    console.log("Clicked row with id:", id);
  };

  const headerStyle = {
    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: '700',
        fontSize:'19px',
        fontFamily:'Nunito Sans'  
    }
  };

  const columns = [
    {
      field: 'list',
      headerName: 'List Name', 
      width: 600,
      editable: true,
      
    },
    // {
    //   field: 'action',
    //   headerName: '', 
    //   width: 100,
    //   editable: true,
    //   renderCell: (params) => (
    //     <Button
    //       variant="contained"
    //       color="primary"
    //       onClick={() => handleButtonClick(params.id)}
    //       endIcon={<ArrowForwardOutlinedIcon />} 
    //       style={{
    //         backgroundColor: 'transparent',
    //         color: 'black',
    //         boxShadow:'none'
    //       }}
    //     >
    //       Select 
    //     </Button>
    //   ),
    // },
  ]

  const rows = [...listsNames].reverse().map((item, index) => ({
    id: index,
    list:item.title,  
    action:'',
  }));
    

  return ( 
    <div className='create-contacts'>
        <div className='cc-cont'>
            <div className='cc-cont-items-1' onClick={handleBackToContacts}>&#8592; Back to Contacts</div>
            <div className='cc-cont-items-2' onClick={handleCreateNewList}>Create new list</div>
             
             <div style={{ height: 600, width: '650px', marginTop:'40px' }}>
              <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              sx={headerStyle}
              />
             </div>

      {showCreateListBox && (
        <div className='modal-overlay'>
        <div className='create-list-box'>
          <div className='create-list-title'>Create new list</div>
          <input
            type='text'
            placeholder='Enter list title'
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
          />
          <div className='create-list-buttons'>
            <div className='create-list-cancel' onClick={handleCancel}>Cancel</div>
            <div className='create-list-continue' onClick={handleContinue}>Continue</div>
          </div>
        </div>
      </div>
    )}  
      </div> 
    </div>
  )   
}

export default CreateContacts
