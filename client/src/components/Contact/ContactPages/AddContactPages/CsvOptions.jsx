import React, { useEffect, useRef, useState } from 'react';
import '../../../../style/CsvOptions.css';
import Tab from '@mui/material/Tab'; 
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel'; 
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';
import Button from '@mui/material/Button';


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
    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  uploadContainer: {
    border: '2px dashed #000',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    height: '300px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  uploadButton: {
    marginTop: '10px',
  },
  tabPanel: {
    marginTop: '40px', // Adjust this value to increase/decrease the vertical distance
  },
  uploadText: {
    marginBottom: '20px', // Adjust this value to increase/decrease the margin between texts
    fontSize: '20px',
  },
});


function CsvOptions({ setCsvData }) {
    const [activeTab, setActiveTab] = useState('upload');
    const [showFileInput, setShowFileInput] = useState(true);
    const fileInputRef = useRef(null);
    const hiddenFileInputRef = useRef(null);
    const [value, setValue] = useState('1');

    const classes = useStyles();

    useEffect(() => {
        setShowFileInput(true)
      }, []);


    const handleChange = (e,newValue) =>{
      setValue(newValue)
    }

    const handleFileButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    // const handleFileChange = (e) => {
    //     console.log('handleFileChange')
    //     const selectedFile = e.target.files[0];
    //     const csvActualFileName = selectedFile.name;
        
    //     if (selectedFile) {
    //       const reader = new FileReader();
    //       reader.onload = (e) => {
    //         const parsedCsvData = parseCsvString(e.target.result);
    //         setCsvData({data: parsedCsvData, fileName:csvActualFileName });
    //         setShowFileInput(false);  
    //       };
    //       reader.readAsText(selectedFile);
    //     }
    //     e.target.value = null;
    //   };

    // const parseCsvString = (csvString) => {
    //     const rows = csvString.split('\n');
    //     const data = rows.map((row) => row.split(','));
    
    //     return data;
    //   };

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      const csvActualFileName = selectedFile.name;
      
      if (selectedFile) {
        Papa.parse(selectedFile, {
          complete: (result) => {
            // Result.data contains the parsed CSV data
            console.log(result)
            if (Array.isArray(result.data) && result.data.length > 0) {
              const parsedCsvData = result.data.filter(row =>
                Object.values(row).some(cell => cell !== undefined && cell.trim() !== '')
              )
              console.log(parsedCsvData)
              setCsvData({ data: parsedCsvData, fileName: csvActualFileName });
              setShowFileInput(false);

            } else {
              console.error("Invalid CSV format. Data is not an array or is empty.");
            }
          },
          header: true, // Set to true if your CSV file has headers
        });
      }
      e.target.value = null;
    };

    return (
        <div className='csv-options-container'>
          <div className='csv-options'>
            <TabContext value={value}>
              <TabList onChange={handleChange} aria-label="lab API tabs example"
              sx={{
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }} 
              className={classes.tabList}
              >
                <Tab label="CSV Upload" value="1" className={classes.tab}
                sx={{
                  '&:not(.Mui-selected):hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                  }
                }}
                />
                <Tab label="CSV Paste" value="2" className={classes.tab}
                sx={{
                  '&:not(.Mui-selected):hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                  }
                }}
                />
                <Tab label="Upload" value="3" className={classes.tab}
                sx={{
                  '&:not(.Mui-selected):hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                  }
                }}
                />
              </TabList>

              <TabPanel value='1'>
              {showFileInput ? (
              <div className={classes.uploadContainer} onClick={handleFileButtonClick}>
                <CloudUploadIcon className={classes.uploadIcon} />
                <div className={classes.uploadText}>Upload CSV File</div>
                <div style={{ fontSize: '20px' }}>Supported files: CSV</div>
                <input
                  ref={fileInputRef}
                  type='file'
                  id='file-upload'
                  onChange={handleFileChange}
                  accept='.csv'
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div>
                
              </div>
            )}
          </TabPanel>

          <TabPanel value='2'>
              
          </TabPanel>

          <TabPanel value='3'>
            
          </TabPanel>

        </TabContext>
          </div>

          {/* {activeTab === 'upload' && (
        <div className='csv-select-button-container'>
            {showFileInput && (
                <>
            <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".csv"
                style={{ display:'none' }}
            />

            <label
              htmlFor="file-upload"
              className="custom-file-upload" onClick={handleFileButtonClick}>
              Select CSV
            </label>
          </>
            )}
        </div>
      )} */}

    </div>
      );
}

export default CsvOptions
