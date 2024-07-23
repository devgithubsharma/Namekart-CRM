import React from "react";
import Namekart from './Namekart';
import {useNavigate } from 'react-router';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const Topbar = () => {

const navigate = useNavigate();

const goToHome = () => {
    navigate('/home/manualCampaigns');
  };

  return (
    <div style={styles.topbar}>
      <Namekart />
      <HomeOutlinedIcon style={styles.homeIcon} onClick={goToHome} />
    </div>
  );
};

const styles = {
  topbar: {
    width: "100%",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000000",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "0 20px",
  },
  homeIcon: {
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "36px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    paddingRight: "50px"
  },
};

export default Topbar;