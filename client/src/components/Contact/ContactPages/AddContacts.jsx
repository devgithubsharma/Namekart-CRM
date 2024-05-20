    import React, { useEffect, useState } from 'react'
    import { Link, useLocation } from 'react-router-dom'
    import '../../../style/AddContacts.css'
    import { DataGrid } from '@mui/x-data-grid';
    import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
    import axios from 'axios';
    
    function AddContacts() { 
        const [newEmails, setNewEmails] = useState([]);
        // const location = useLocation(); 
        // const listsDataId = location.state.id;
    
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

        const rows = newEmails.map((emailObj,index) => ({
            id: index,
            Contact:emailObj.emails,
            status: ''
        }));
                
    return (
        <div className='addContacts'>
            <div className='addcont-container'>
                <div className='addcont'>
                    <div className='addcont-left'>  
                        <Link to='createContacts' className='addcont-items'>Add Contacts</Link>
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
    )
    }

    export default AddContacts
