import React from 'react'

function SelectCSV() {
  return (
    <div className='csv-file-input-container'>
       <input
            // ref={fileInputRef}
            type="file"
            // onChange={handleFileChange}
            accept=".csv"
            // style={{ display: 'none' }}
            />
    </div>
  )
}

export default SelectCSV
