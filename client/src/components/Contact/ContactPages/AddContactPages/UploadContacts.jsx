import React, { useState } from 'react'
import {  useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import CsvDisplay from './CsvDisplay';
import CsvOptions from './CsvOptions';
import '../../../../style/UploadContacts.css'
    
function UploadContacts() { 
    const [csvData, setCsvData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const listTitle = location.state && location.state.listTitle;
    const titleId = location.state && location.state.titleId;

    const handleBackToCreateContacts = () =>{
        navigate(-1)
    }
  
    return (
      <div className='upload-contacts'>
        <div onClick={handleBackToCreateContacts} className='uc-backButoon'> &#8592; Back to list selection</div>
        <CsvOptions setCsvData={setCsvData} />
        {csvData && <CsvDisplay csvData={csvData} listTitle={listTitle} titleId={titleId}/>}
      </div>
    ); 
}

export default UploadContacts
