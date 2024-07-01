import React, { useEffect, useState, useContext } from 'react'
import { Typography,Tab,Tabs, TextField, Box, Chip, Stack,Button, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { makeStyles } from '@mui/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useNavigate } from 'react-router';
import { GlobalContext } from './ContextApi/GlobalContext';
import {fetchCampId} from '../api'
import {fetchIndexData} from '../api'
// import ChatBox from './ChatBox';

const useStyles = makeStyles({
    boldHeader: {
      fontWeight: 'bold', 
    },
    clickableRow: {
      cursor: 'pointer',
  },

  });

function EmailChatting() {
    const classes = useStyles();
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const [horizontalValue, setHorizontalValue] = useState(0); 
    const [indexData, setIndexData] = useState([])
    const [searchText, setSearchText] = useState('');
    const [filterText, setFilterText] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const { userId } = useContext(GlobalContext);
    // const [selectedEmail, setSelectedEmail] = useState(null);
    // const [chatHistory, setChatHistory] = useState([]);
    // const [replyText, setReplyText] = useState('');

    const typeMapping = ['All', 'Live Detect', 'Bulk', 'Manual']; 

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    const handleHorizontalChange = (event, newValue) => {
        setHorizontalValue(newValue);
    };

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
        setFilterText(event.target.value); 
    };

    const handleSearchClick = () => {
        setFilterText(searchText);
    };

    const handleRowClick = async (params) => {
      const email = params.row;
      const email_id = email.emailId
      // const response = await axios.get(`https://crmapi.namekart.com/api/chatsCampId/${email_id}`); 
      const response = await fetchCampId(email_id)
      console.log("response",response)
      console.log(response.data[0].threadId)
      const threadId = response.data[0].threadId
      navigate(`/home/chats/${threadId}`); 
  };




    useEffect(() => {
        const fetchData = async () => {
            try {
                // const response = await axios.get(`https://crmapi.namekart.com/api/indexData/${userId}`, {
                //     params :{
                //         type: typeMapping[value] 
                //     }                 
                // });
                const response = await fetchIndexData(userId,typeMapping[value])

                console.log(response.data.result)
                const mappedData = response.data.result.map((item, index) => ({
                    id: index, // Ensure each item has a unique ID
                    emailId: item.email_id,
                    sender: item.receiver_email,
                    subject: item.subject,
                    body: item.emailBody,
                    time: item.receivedTime || 'Unknown'
                }));
                setIndexData(mappedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [value]);

    const filteredEmails = indexData.filter(email => {
      const emailDate = new Date(email.time).setHours(0, 0, 0, 0);
      const selectedDateOnly = selectedDate ? new Date(selectedDate).setHours(0, 0, 0, 0) : null;
      const dateMatches = selectedDateOnly ? emailDate === selectedDateOnly : true;
      const lowerCaseFilterText = filterText.toLowerCase();
      const textMatches = filterText ? (
          email.sender.toLowerCase().includes(lowerCaseFilterText) ||
          email.subject.toLowerCase().includes(lowerCaseFilterText) ||
          email.body.toLowerCase().includes(lowerCaseFilterText)
      ) : true;
  
      return dateMatches && textMatches;
  });
    // const filteredEmails = filterText ? indexData.filter(email => {
    //     return (
    //         email.sender.toLowerCase().includes(filterText.toLowerCase()) ||
    //         email.subject.toLowerCase().includes(filterText.toLowerCase()) ||
    //         email.body.toLowerCase().includes(filterText.toLowerCase())
    //     );
    // }) : indexData;

    // Columns for the DataGrid
    const columns = [
        { field: 'sender', headerName: 'Sender', width: 200 },
        { field: 'subject', headerName: 'Subject', width: 150 },
        { field: 'body', headerName: 'Body text', width: 300 },
        { field: 'time', headerName: 'Time', width: 100 }
    ];



    return (
        <Box sx={{ display: 'flex', height: '100vh' }}> 
          <Box sx={{ width: '200px',borderRight: 1, borderColor: 'divider' }}> 
            <Typography variant="h5" sx={{ p: 2 , fontWeight: 'bold'}}>
              Messages
            </Typography>
            
            <Box sx={{ pt: 4, pl: 0, position: 'relative' }}> 
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{ height: 'auto', 
                    '& .MuiTab-root': { 
                        '&:hover': {
                          backgroundColor: 'transparent', 
                        }
                      },
                      '& .Mui-selected': { 
                        color: 'black', 
                      }
                    }} 
                    TabIndicatorProps={{ style: { backgroundColor: 'black' }}} 
              >

                <Tab label="All" />
                <Tab label="Live Detect" />
                <Tab label="Bulk" />
                <Tab label="Manual" />
              </Tabs>
              {/* <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 1, bgcolor: 'divider' }} /> */}
            </Box>
          </Box>

        
          <Box sx={{ flexGrow: 1, p: 2 }}>
            <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Search Emails"
                        variant="outlined"
                        value={searchText}
                        onChange={handleSearchChange}
                        InputProps={{
                          endAdornment: (
                              <InputAdornment position="end">
                                  <Button onClick={handleSearchClick} sx={{ minWidth: 'auto', padding: 0 }}>
                                      <SearchOutlinedIcon sx={{ fontSize: 30 }}/>
                                  </Button>
                              </InputAdornment>
                          ),
                      }}
                        sx={{ mr: 1, borderRadius:"12px", width: '783px' }} 
                    />
                    {/* <Button variant="contained" 
                        onClick={handleSearchClick}
                        sx={{ 
                            height: '45px',  
                            minWidth: 'auto', 
                            padding: '6px 10px', 
                            fontSize: '0.875rem',
                            borderRadius:"16px"

                        }} 
                    >Search</Button> */}
            </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Tabs
            orientation="horizontal"
            variant="scrollable"
            value={horizontalValue}
            onChange={handleHorizontalChange}
            sx={{ 
              height: 'auto', // Set height to auto to fit content
              '& .MuiTab-root': { // Styles for all tabs
                '&:hover': {
                  backgroundColor: 'transparent', // Remove green background on hover
                }
              },
              '& .Mui-selected': { // Styles for the selected tab
                color: 'black', // Set text color of selected tab to black
              }
            }}
            TabIndicatorProps={{ style: { backgroundColor: 'black' } }} // Set the indicator line color to black
          >
            <Tab label="Inbox" />
            <Tab label="Sent" />
            <Tab label="Drafts" />
          </Tabs>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                    label="Filter by Date"
                    value={selectedDate}
                    onChange={(newValue) => {
                        setSelectedDate(newValue);
                    }}
                    sx={{ width: '200px', marginRight: '90px' }} 
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>

        </Box>
      <Box sx={{width:"90%", height:"70%"}}>
          {horizontalValue === 0 && ( // Only display DataGrid when 'Inbox' is selected
              <DataGrid
              rows={filteredEmails} // Provide an empty array as a fallback
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              onRowClick={handleRowClick}
              componentsProps={{
                row: {
                    className: classes.clickableRow,
                },
            }}
            
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(235, 235, 235, 0.7)', 
                  color: 'black', // Set text color to black
                  fontWeight: '900' // Make text bold
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              }}
              />
            )}
      </Box>

      </Box>
    </Box>
      
  );
}

export default EmailChatting








