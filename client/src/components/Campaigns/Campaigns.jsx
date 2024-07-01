import React, { useState, useEffect,useContext } from 'react';
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
import { GlobalContext } from '../ContextApi/GlobalContext';
import {fetchTag} from '../../api'
import {fetchCampaign} from '../../api'
import {deleteCampaigns} from '../../api'
import {saveCampaign} from '../../api'

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
  const { userId } = useContext(GlobalContext);

  console.log("userId",userId)

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
        // const response = await axios.get(`https://crmapi.namekart.com/api/fetchTags/${userId}`); 
        const response = await fetchTag(userId)
        setTags(response.data.result);  
        console.log("tags",response.data.result) 
      } catch (error) {  
        console.log('Error fetching tags:', error); 
      }   
    }; 
    fetchTags();  
  }, []);


  useEffect(()=>{
    const fetchCampaigns = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getCampaignsData/${userId}`);
        const response = await fetchCampaign(userId)
        console.log(response.data)
        setCampaigns(response.data.result);
      } catch (error) {
        console.log('Error fetching campaigns:', error);
      }
    };
    fetchCampaigns();
  },[])
  

//   useEffect(() => {
//   fetchCampaignss().then((res)=>{console.log(res.data)
//     setCampaigns(res.data.result);}).catch((err)=>{console.log('Error fetching campaigns:', err);});
// }, []);


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

    navigate('/home/mailingCampaigns', { state: {
      campName: clickedCampaign.camp_name,
      titleId: clickedCampaign.title_id,
      campId: clickedCampaign.camp_id,
      userId:userId
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
      // const response = await axios.delete('https://crmapi.namekart.com/api/deleteCampaign',{
      //   data: { campId: campId } 
      // })
      const response = await deleteCampaigns(campId)
      // const updatedCampaigns = await axios.get(`https://crmapi.namekart.com/api/getCampaignsData/${userId}`);
      const updatedCampaigns = await fetchCampaign(userId)
      setCampaigns(updatedCampaigns.data.result);

    }catch(err){
      console.log('Error in deletion of campaign',err);
    }
  };
   
const columns = [
  { field: 'camp_name', headerName: 'Campaigns', width:150, renderHeader: (params) => (
    <strong style={{ fontWeight: 'bold', fontSize: '16px' }}>
      {params.colDef.headerName}
    </strong> // Increase font weight and size
  )
},                   
  {                    
    field: 'actions',           
    headerName: 'Actions',
    renderHeader: (params) => (
      <div style={{ textAlign: 'right', paddingLeft: '550px', fontWeight: 'bold', fontSize: '16px' }}> {/* Adjust this padding to align with the icon */}
        {params.colDef.headerName}
      </div>
      
    ),
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
        style={{ cursor: 'pointer',marginLeft:'560px', display: 'flex', 
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
       saveCampaign(campaignName,selectedTag.tags,selectedTag.title_id,userId).then(response =>{
          console.log('Axios success:', response)
          if (response.data.success) {
            setCampaigns(prevCampaigns => [
        {
          id: response.data.id,
          name: campaignName,
        },...prevCampaigns
      ])}    
          handleCancel();
          navigate('/home/mailingCampaigns',{state :{
            campName:campaignName,
            titleId:selectedTag.title_id,
            campId:response.data.camp_id,
            userId:userId
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


export default Campaigns;