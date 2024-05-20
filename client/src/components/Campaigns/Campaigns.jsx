import React, { useState, useEffect } from 'react';
import '../../style/Campaigns.css';
import Modal from 'react-modal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';   
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuickCampaignModal from './QuickCampaign';

Modal.setAppElement('#root'); 
  
function Campaigns() { 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [campaignName, setCampaignName] = useState('');
  const [selectedTag, setSelectedTag] = useState({});
  const [campaigns,setCampaigns] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isIconButtonFocused, setIconButtonFocused] = useState(false);
  const iconButtonStyle = isIconButtonFocused ? { outline: 'none' } : {};
  const [tags, setTags] = useState([]);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [isQuickCampaignModalOpen, setIsQuickCampaignModalOpen] = useState(false);


  const handleOpenModal = () => {
    setIsQuickCampaignModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsQuickCampaignModalOpen(false);
  };
   
  useEffect(() => {     
    const fetchTags = async () => {
      console.log('Fetch tags called')   
      try {
        const response = await axios.get('http://localhost:3001/api/fetchTags'); 
        setTags(response.data.result);   
      } catch (error) {  
        console.log('Error fetching tags:', error); 
      }   
    }; 
    fetchTags();  
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getCampaignsData');
      console.log(response.data)
      setCampaigns(response.data.result);
    } catch (error) {
      console.log('Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
  fetchCampaignss().then((res)=>{console.log(res.data)
    setCampaigns(res.data.result);}).catch((err)=>{console.log('Error fetching campaigns:', err);});
}, []);


  useEffect(() => {
    console.log('Campaigns updated:', campaigns);
  }, [campaigns]);
  

  const openModal = () => {
    setStep(1);
    setIsModalOpen(true); 
  };  

  const handleCancel = () => {       
    setCampaignName('');      
    setSelectedTag('');  
    setStep(1);  
    setIsModalOpen(false); 
  };

  const handleRowClick = (params) => {
    const clickedCampaign = campaigns.find(campaign => campaign.camp_name === params.row.camp_name);

    navigate('/mailingCampaigns', { state: {
      campName: clickedCampaign.camp_name,
      titleId: clickedCampaign.title_id,
      campId: clickedCampaign.camp_id
    }});
  };


  const handleTagChange = (e) => {
    const selectedValue = e.target.value;
    const selectedTagObject = tags.find(tag => tag.tags === selectedValue);
    console.log(selectedTagObject)
    setSelectedTag(selectedTagObject);
  };

  const deleteCampaign = async (campId) => {
    // e.preventDefault()
    console.log(campId)
    try{
      const response = await axios.delete('http://localhost:3001/api/deleteCampaign',{
        data: { campId: campId } 
      })
      const updatedCampaigns = await axios.get('http://localhost:3001/api/getCampaignsData');
      setCampaigns(updatedCampaigns.data.result);

    }catch(err){
      console.log('Error in deletion of campaign',err);
    }
  };
   
const columns = [
  { field: 'camp_name', headerName: 'Campaign Name', width:500 },                   
  {                    
    field: 'actions',           
    headerName: '',
    renderCell: (params) => {
      const handleOpenMenu = (event) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedRow(params.row);
      };
      const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setSelectedRow(null);
      };
  
      return (
        <>
        <IconButton onClick={handleOpenMenu} 
        onFocus={() => setIconButtonFocused(true)}
        onBlur={() => setIconButtonFocused(false)}
        style={{ cursor: 'pointer',marginLeft:'200px', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', ...iconButtonStyle }} >
          <MoreVertIcon />
        </IconButton>
        <Menu
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl) && selectedRow?.id === params.row.id}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {/* Handle Rename action */}}> <EditIcon/> &nbsp; Rename the title
        </MenuItem>
          {/* <MenuItem onClick={() => Handle Start Campaign action}> <PlayArrowIcon/> &nbsp; Start Campaign</MenuItem> */}
          <MenuItem onClick={() => deleteCampaign(params.row.camp_id)} style={{color:'red'}}> <ClearIcon /> &nbsp; Delete Campaign
          </MenuItem>
        </Menu>
      </>
      );
    },
    sortable: false,
    width: 700,
  },
];
  

const rows = [...campaigns].reverse().map((campaign,index) => ({
  id:index,
  camp_name: campaign.camp_name,
  camp_id: campaign.camp_id,
  
}));

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      try {
       axios.post('http://localhost:3001/api/campaignsData', { campaignName, tagName: selectedTag.tags,
        titleId : selectedTag.title_id }).then(response =>{
          console.log('Axios success:', response)
          if (response.data.success) {
            setCampaigns(prevCampaigns => [
        {
          id: response.data.id,
          name: campaignName,
        },...prevCampaigns
      ])}    
          handleCancel();
          navigate('/mailingCampaigns',{state :{
            campName:campaignName,
            titleId:selectedTag.title_id,
            campId:response.data.camp_id
          }})   
        }).catch(err =>{
          console.error('Axios error:', err);
        })        
      } catch (error) {  
        console.error('Error creating campaign:', error);
      }
    }
  }; 

  return (
    <div className='campaign-container'>
      <h2 className="campaign-heading">Campaigns</h2>
      <div className='campaign-bar'>
        <div className="left-buttons">
          <button className="button black" onClick={openModal}>Create campaign</button>
          <button className="button black" onClick={handleOpenModal}>Quick Campaign</button>
        </div>
        <div className="campaign-info">
          <a href="#" className="learn-more">Learn How to Launch Your First Campaign</a>
          <button className="button black">Help</button>
        </div>
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          checkboxSelection
          disableSelectionOnClick
          sx={{cursor:'pointer'}}
          onRowClick={handleRowClick}
        />
      </div>
      <QuickCampaignModal isOpen={isQuickCampaignModalOpen} onClose={handleCloseModal} />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancel}
        contentLabel="Create Campaign"
        className="Modal"
        overlayClassName="Overlay"   
      >    
        {step === 1 ? (   
          <div> 
            <h2>Enter the name of your campaign</h2>
            <input
              type="text"  
              value={campaignName} 
              onChange={e => setCampaignName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleContinue}>Continue</button>
            </div>  
          </div>          
        ) : (       
            <div className="step-2-container">        
            <h2>Campaign segment filters</h2>   
            <div className="condition-box">         
              <div className="condition-select">
                <label>Select Condition</label>   
                <select> 
                  <option value="Tags include">Tags include</option> 
                </select>   
              </div>  
              <div className="tags-select">  
                <label>Select Tag</label> 
                <select onChange={handleTagChange} value={selectedTag.tags || ''}>
                  <option value="">Select tag</option>
                  {tags.length>0 ? (
                    tags.map((tagObject,index) => (
                      <option key={index} value={tagObject.tags}>{tagObject.tags}</option>
                    ))
                  ) :(
                      <option>Loading tags...</option>
                  )}   
                </select>
              </div>
            </div>
            <div className="campaign-actions"> 
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button className="create-button" onClick={handleContinue}>Create campaign</button>
            </div>
          </div>
        )}
      </Modal>
    </div>    
  );
}

const fetchCampaignss =  () => {
  
    return axios.get('http://localhost:3001/api/getCampaignsData');
    
};

export default Campaigns;