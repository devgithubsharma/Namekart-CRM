import React, { useEffect, useState } from 'react';
import '../../style/Contacts.css';
import { Link, Outlet } from 'react-router-dom'; 
import Tab from '@mui/material/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import { DataGrid } from '@mui/x-data-grid';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

const useStyles = makeStyles({
  tab: {
    color: 'black',
    marginRight: '20px',
    '&.Mui-selected': {
      backgroundColor: 'black',
      color: 'white',
      borderRadius:'20px',

    },
  },
  tabList: {
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
    },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
  }
});

function Contacts() {  
  const [value, setValue] = useState('1');
  const [newEmails, setNewEmails] = useState([]);
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect( () => {
    const fetchContactsList = async () =>{
        try{
            const response = await axios.get('http://localhost:3001/api/getContactList');
            console.log(response.data.result)
            setNewEmails(response.data.result)
        }catch(err){
          console.log('Error in fetching Contacts', err)
        }   
    }  
    fetchContactsList();
}, []);


const headerStyle = {
  '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: '650',
      fontSize:'18px',
      fontFamily:'Nunito Sans'
      
  }
};

const columns = [
  { field: 'Contact', headerName: 'Contact', width: 700 },
  {
  field: 'status',
  headerName: 'Status', 
  width: 200,
  editable: true,
  headerAlign:'center',
  align:'center',
  renderCell: (params) => <AcUnitOutlinedIcon />
  },
];

const rows = [...newEmails].reverse().map((emailObj,index) => ({
  id: index,
  Contact:emailObj.emails,
  status: ''
}));

  return (     
    <div className='contacts'>   
        <div className='conts-container'> 
          <TabContext value={value}>
            <TabList onChange={handleChange} aria-label="lab API tabs example"
            // style={{display:'flex',justifyContent:'center',alignItems:'center'}}
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
            className={classes.tabList}
            >
              <Tab label="Contacts" value="1" className={classes.tab} 
              sx={{ 
               '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
              }}  
              />
              <Tab label="List" value="2" className={classes.tab} sx={{ '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // or any other color
              } }}/>
              <Tab label="Segment" value="3" className={classes.tab} sx={{ '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // or any other color
              } }}/>
            </TabList>

            <TabPanel value="1">
            <div className='addContacts'>
            <div className='addcont-container'>
                <div className='addcont'>
                    <div className='addcont-left'>  
                        <Link to='/createContacts' className='addcont-items'>Add Contacts</Link>
                        <div className='addcont-items'>View metrics</div>
                        <div className='addcont-items'>Filters</div>
                    </div>                        
                    
                    <div className='addcont-right'>
                        <div className='addcont-items'>Learn how to add contacts</div>
                        <div className='addcont-items'>Help</div>
                    </div>
                </div> 
            </div>
            <div className='contacts-data'>
                <div style={{ height: 500, width: '90%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        checkboxSelection
                        disableSelectionOnClick
                        sx={headerStyle}
                    />
                </div>   
            </div>
        </div>
      </TabPanel>
    </TabContext>
        </div>
    </div>
  )
}

export default Contacts
