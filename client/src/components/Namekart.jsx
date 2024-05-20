import React from 'react';
import { Button } from '@mui/material';
import nks from '../images/nks.png'


const Namekart= () => {
  return (
    <Button
      variant="contained"
      sx={{
        width: '178px',
        height: '40px',
        borderRadius: '0',
        transform: 'rotate(0deg)',
        opacity: '1',
        backgroundColor: '#000000',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#000000',
        },
      }}
    >
      <img
        src={nks}
        alt="placeholder"
        style={{
          borderRadius: '0',
          transform: 'rotate(0deg)',
          opacity: '10',
        //   backgroundColor:'black',
        //   color:'white'
        }}
      />
      <span
        style={{
          width: '94px',
          height: '26px',
          transform: 'rotate(0deg)',
          opacity: '1',
          fontSize: '16px',
          fontWeight: 'light',
          marginLeft: '5px',
          fontFamily:'cursive'
        }}
      >
        namekart
      </span>
    </Button>
  );
}

export default Namekart;