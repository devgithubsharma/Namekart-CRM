import React, { useCallback, useEffect, useState  } from 'react'
import '../../style/MailingCampaigns.css';
import Tab from '@mui/material/Tab'; 
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel'; 
import { DataGrid } from '@mui/x-data-grid';
import { useLocation, useNavigate } from 'react-router';
import EmailIcon from '@mui/icons-material/Email';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { makeStyles } from '@material-ui/core/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { Box, FormControlLabel, Switch, Tabs, Tooltip } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SingleInputTimeRangeField } from '@mui/x-date-pickers-pro/SingleInputTimeRangeField';
import CloseIcon from '@mui/icons-material/Close';
import DriveFileRenameOutlineTwoToneIcon from '@mui/icons-material/DriveFileRenameOutlineTwoTone';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ClearIcon from '@mui/icons-material/Clear';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { updateCampaignStatus } from '../IndexedDB/CampaignStatusIdb';
import { fetchCampaignStatus } from '../IndexedDB/CampaignStatusIdb';
import { Snackbar } from '@mui/material';
import {saveSequences} from '../../api'
import {updateSequences} from '../../api'
import {deleteSequence} from '../../api'
import {fetchSenderEmails} from '../../api'
import {fetchSequenceDetails} from '../../api'
import {deleteStep} from '../../api'
import {fetchUpdatedSequence} from '../../api'
import {fetchTag} from '../../api'
import {fetchSenderNames} from '../../api'
import {fetchListData} from '../../api'
import {fetchDomainNames} from '../../api'
import {deleteCampaigns} from '../../api'
import {startCampaigns} from '../../api'

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
  }
});

const useStyles1 = makeStyles((theme) => ({
  tab: {
    color: 'black',
    fontSize: '0.4rem', 
    minWidth: 30,  
    padding: '3px 6px', 
    textTransform: 'none', 
    '&.Mui-selected': {
      backgroundColor: '#7fff7f',
      color: 'black',
      borderRadius:'20px',

    },
  },
  tabList: {
   '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
}));

const reactQuillTheme = {
  lineHeight: 1.5
};


const initialEmailStep = {
  id:`${uuidv4()}-${Date.now()}`,
  name:'',
  subject: '',
  pretext: '',
  body: '',
  delay: 3, 
};




const theme = createTheme({
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: '90px', 
          '&:not(.Mui-selected):hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});


// function scheduleFunction() {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <MailingCampaigns />
//     </LocalizationProvider>
//   );
// }


function MailingCampaigns() {
  const [value, setValue] = useState('1');
  const [value1,setValue1] = useState('1')
  const [value2,setValue2] = useState('1')
  const [emails, setEmails] = useState([])
  const [selectedEmails2, setSelectedEmails2] = useState([]);
  const [showInputBoxes, setShowInputBoxes] = useState(false); 
  const [subject, setSubject] = useState('');
  const [pretext, setPretext] = useState(''); 
  const [body,setBody] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);  
  const [senderEmails,setSenderEmails] = useState([])
  const [senderSelected,setSenderSelected] = useState([]);
  const [confirmedTag, setConfirmedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCard, setSelectedCard] = useState(0);
  const [emailCnt, setEmailCnt] = React.useState('');
  const [intervals, setIntervals] = useState([{ id: 1 }]);
  const [openMenu, setOpenMenu] = useState({ sequenceId: null, stepId: null });
  const [selectedStep, setSelectedStep] = useState(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [tempStepName, setTempStepName] = useState('');
  const [renamingStepIndex, setRenamingStepIndex] = useState(null);
  const [isLoadingEmailTemplate, setIsLoadingEmailTemplate] = useState(false);
  // const [delays, setDelays] = useState(Array(emailSteps.length - 1).fill({ days: 3 }));
  const [activeSequenceTab, setActiveSequenceTab] = useState('default'); 
  const [emailSteps, setEmailSteps] = useState([{ id:`${activeSequenceTab}-${Date.now()}`, name:'', subject: '', pretext: '', body: '', delay: 3 }]);
  const [sequences, setSequences] = useState([
    { id: 'default', name:'Seq', isEnabled:true, isNew: true, steps: [{ id:`${activeSequenceTab}-${Date.now()}`,
    name:'',
    subject: '',
    pretext: '',
    body: '',
    delay: 3,}]} 
  ]);
  const [isEditSequenceDialogOpen, setIsEditSequenceDialogOpen] = useState(false);
  const [currentSequence, setCurrentSequence] = useState(null);
  const [savedSequenceCheck, setSavedSequenceCheck] = useState(false);
  const [domainNames,setDomainNames] = useState([]);
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [isFirstEmail, setIsFirstEmail] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snapshotEffect, setSnapshotEffect] = useState(false);
  const [senderNames, setSenderNames] = useState([])
  const [receiverName, setReceiverName] = useState([]);
  const [domainLink,setDomainLink] = useState([]);
  const [leads,setLeads] = useState([])
  // const isSaveEnabled = sequences.some(seq => seq.steps.some(step => !step.isSaved));
  // const isUpdateEnabled = sequences.some(seq => seq.steps.some(step => step.isSaved && step.isUpdated));
  

  const navigate = useNavigate();                   
  const location = useLocation();
 
  const campName = location.state.campName;
  const titleId = location.state.titleId;
  const campId = location.state.campId;
  const userId = location.state.userId

  console.log("CampName",campName)
  console.log("titleId",titleId)
  console.log("campId",campId)
  console.log("userId",userId)

  const sequenceIndex = sequences.findIndex(seq => seq.id === activeSequenceTab);
  const stepIndex = sequences[sequenceIndex]?.steps.findIndex(step => step.id === selectedStep);

  useEffect(()=>{
    console.log('selectedStep',selectedStep)
  },[selectedStep])

  const classes = useStyles()
  const classes1 = useStyles1()

  const activeSequence = sequences.find(seq => seq.id === activeSequenceTab);

  function CharacterCount({ text, maxLength }) {
    return (
      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'gray' }}>
        {text.length}/{maxLength}
      </div>
    );  
  } 

  useEffect(() =>{  
    console.log('Sequence',sequences)
  },[sequences])


  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
};
  
  const triggerSnapshotEffect = () => {
    setSnapshotEffect(true);
    setTimeout(() => setSnapshotEffect(false), 100); // Duration of snapshot effect
  };

  const DelayComponent = ({ delay, setDelay, index }) => {
    const handleIncrement = () => {
      setDelay(index, delay[index].days + 1);
    };
  
    const handleDecrement = () => {
      setDelay(index, Math.max(0, delay[index].days - 1));
    };
  
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '5px 0' }}>
        <IconButton onClick={handleDecrement} size="small">
          <RemoveIcon />
        </IconButton>

        <Typography variant="body2" style={{ margin: '0 10px' }}>
          Wait for {delay[index].days} days
        </Typography>

        <IconButton onClick={handleIncrement} size="small">
          <AddIcon />
        </IconButton>
      </div>
    );
  };

  useEffect(() =>{
    console.log('activeSequenceTab',activeSequenceTab)
  },[activeSequenceTab])

  useEffect(()=>{
    console.log('savedSequenceCheck',savedSequenceCheck)
  },[savedSequenceCheck])

  function EditSequenceDialog({ open, sequence, onSave, onCancel, onDelete, onToggleEnabled,sequencesLength }) {
    const [name, setName] = useState(sequence?.name || '');
    const [isEnabled, setIsEnabled] = useState(sequence?.isEnabled || false);
  
    
    useEffect(() => {
      if (sequence) {
        setName(sequence.name || '');
        setIsEnabled(sequence.isEnabled || false);
      }
    }, [sequence]);
  
    return (
      <Dialog open={open} onClose={onCancel}>
        <DialogTitle>Edit Sequence</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Sequence Name"
            type="text"
            fullWidth
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormControlLabel
            control={<Switch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />}
            label={isEnabled ? "Enabled" : "Disabled"} // Dynamically change the label based on isEnabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} style={{color:'black'}} >Cancel</Button>
          <Button onClick={() => onDelete(sequence.id)} 
          >Delete Sequence</Button>
          
          <Button onClick={() => onSave(sequence.id, name, isEnabled)} style={{backgroundColor:'#009900',color:'white', borderRadius:'15px'}}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const handleSaveSequence = (id, newName, newIsEnabled) => {
    const updatedSequences = sequences.map((sequence) =>
      sequence.id === id ? { ...sequence, name: newName, isEnabled: newIsEnabled } : sequence
    );
    console.log(updatedSequences)
    setSequences(updatedSequences);
    setIsEditSequenceDialogOpen(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditSequenceDialogOpen(false);
  };

  const saveSequence = async () => {
    const sequenceData = {
        sequenceName: activeSequence.name,
        // campaignId: campId, 
        isNew:activeSequence.isNew,
        steps: activeSequence.steps
    }

    console.log(sequenceData)

    try {
        // const response = await axios.post('https://crmapi.namekart.com/api/saveSequenceDetails', sequenceData);
        const response = await saveSequences(sequenceData);
        console.log(response.data);
        setSnackbarMessage('Sequence saved successfully!');
        triggerSnapshotEffect();
        
    } catch (error) {
        console.error('Error saving sequence:', error);
        setSnackbarMessage('Failed to save sequence.');
    }
    setSnackbarOpen(true);
};


const handleUpdateSequence = async () => {
  const sequenceToUpdate = sequences.find(seq => seq.id === activeSequenceTab);
  if (!sequenceToUpdate) {
    console.error('No active sequence found for updating.');
    return;
  }

  try {
    console.log("sequenceToUpdate.steps",sequenceToUpdate.steps)
    // const response = await axios.put('https://crmapi.namekart.com/api/updateSequenceDetails', {
    //   sequenceId: sequenceToUpdate.id,
    //   sequenceName: sequenceToUpdate.name,
    //   steps: sequenceToUpdate.steps,
    // });
    const response = await updateSequences(sequenceToUpdate.id,sequenceToUpdate.name,sequenceToUpdate.steps)
    console.log('Sequence updated successfully:', response.data);
    setSnackbarMessage('Sequence updated successfully!');
    triggerSnapshotEffect();

  } catch (error) {
    console.error('Error updating sequence:', error);
    setSnackbarMessage('Failed to update sequence.');
  }
  setSnackbarOpen(true);
};


const handleDeleteSequence = async (id) => {
  try {
    // await axios.delete(`https://crmapi.namekart.com/api/deleteSequence/${id}`);
    await deleteSequence(id)
    console.log('Sequence deleted successfully');

    const sequenceIndex = sequences.findIndex(sequence => sequence.id === id);
    const updatedSequences = sequences.filter(sequence => sequence.id !== id);

    let newActiveTabId;
    if (updatedSequences.length > 0) {
      if (sequenceIndex === sequences.length - 1) {
        newActiveTabId = updatedSequences[updatedSequences.length - 1].id;
      } else {
        
        newActiveTabId = updatedSequences[sequenceIndex] ? updatedSequences[sequenceIndex].id : updatedSequences[0].id;
      }
    } else {
      const defaultSequence = { id: 'default', name:'Seq', isEnabled:true, isNew: true, steps: [{ id:`${activeSequence.id}-${Date.now()}`,
      name:'',
      subject: '',
      pretext: '',
      body: '',
      delay: 3,}] }
      updatedSequences.push(defaultSequence);
      newActiveTabId = defaultSequence.id;
    }

    setSequences(updatedSequences);
    setActiveSequenceTab(newActiveTabId);

  } catch (error) {
    console.error('Error deleting the sequence:', error);
    
  }

  setIsEditSequenceDialogOpen(false);
};

  
const toggleSequenceEnabled = (sequenceId) => {
  const updatedSequences = sequences.map((sequence) => {
    if (sequence.id === sequenceId) {
      return { ...sequence, isEnabled: !sequence.isEnabled };
    }
    return sequence;
  });

  setSequences(updatedSequences);
};

  const editSequence = (sequenceIndex) => {
    
    const sequence = sequences.find(seq => seq.id === sequenceIndex);
    if (sequence) {
      console.log('sequence',sequence)
      setCurrentSequence(sequence);
      setIsEditSequenceDialogOpen(true);
    } else {
      console.error("Sequence not found");
    }

  };

 
  const RenameDialog = ({ open, onClose, initialName, onSave }) => {
    const [tempName, setTempName] = useState(initialName);
  
    useEffect(() => {
      if (open) {
        setTempName(initialName);
      }
    }, [open, initialName]);
  
    const handleSubmit = () => {
      onSave(tempName);
      onClose(); 
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Rename Step</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Step Name"
            type="text"
            fullWidth
            variant="standard"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    );
  };
  

  const startRename = (index) => {
    setRenamingStepIndex(index);
    setTempStepName(emailSteps[index].name || `Step ${index + 1}`);
    setIsRenameDialogOpen(true);
  };


  const submitRename = () => {
    const updatedSteps = emailSteps.map((step, idx) =>
      idx === renamingStepIndex ? { ...step, name: tempStepName } : step
    );
    setEmailSteps(updatedSteps);
    setIsRenameDialogOpen(false);
    setRenamingStepIndex(null);
    setTempStepName(''); 
  };

  const updateEmailStep = (index, field, value) => {
    setEmailSteps(prevSteps => {
      const updatedSteps = prevSteps.map((step, idx) =>
        idx === index ? { ...step, [field]: value } : step
);
      console.log(`Step ${index} updated with:`, { [field]: value }); 
      return updatedSteps;
    });
  };

  const handleMenuClick = (event, sequenceId, stepId) => { 
    console.log("stepId",stepId)
    console.log("sequenceId",sequenceId)
    event.stopPropagation();
    // Toggle menu only if the same menu is clicked again, or open a new one 
    console.log(openMenu?.stepId === stepId) 
    console.log(openMenu?.sequenceId === sequenceId) 
    const isCurrentMenuOpen = openMenu?.sequenceId === sequenceId && openMenu?.stepId === stepId;
    console.log(isCurrentMenuOpen) 
    if(isCurrentMenuOpen){
      setOpenMenu({ sequenceId: null, stepId: null });
    }else{
      setOpenMenu({ sequenceId, stepId });
    }
    // setOpenMenu(isCurrentMenuOpen ? { sequenceId: null, stepId: null } : { sequenceId, stepId }); 
}; 


  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openMenu !== null && !event.target.closest(".email-step-header-right")) {
        setOpenMenu(null);
      }
    };
  
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [openMenu]);


  const handleCardClick = (index) => {
    setSelectedCard(index); 
  };

  const handleAgeChange = (event) => {
    setEmailCnt(event.target.value);
  };

  const cleanAndCountText = (htmlString) => {
    if (!htmlString) return 0;  // Return 0 if the input is undefined or null
    const plainText = htmlString.replace(/<[^>]+>/g, '').trim(); // Remove HTML tags and trim whitespace
    return plainText.length;
  };

  const EmailsSelection = () =>{
    return (
      <FormControl sx={{ marginTop:1, minWidth: 350, minHeight:40 }}>
        <InputLabel id="demo-simple-select-standard-label">Emails</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={emailCnt}
          onChange={handleAgeChange}
          label="Emails"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={1}>1 Email</MenuItem>
          <MenuItem value={3}>3 Emails</MenuItem>
          <MenuItem value={5}>5 Emails</MenuItem>
          <MenuItem value={10}>10 Emails</MenuItem>
          <MenuItem value={15}>15 Emails</MenuItem>
          <MenuItem value={20}>20 Emails</MenuItem>
          <MenuItem value={25}>25 Emails</MenuItem>
          <MenuItem value={30}>30 Emails</MenuItem>
          <MenuItem value={35}>35 Emails</MenuItem>
          <MenuItem value={40}>40 Emails</MenuItem>
        </Select>
      </FormControl>
    )
  }
  

  const TimeRangeField = () => {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer
        components={['MultiInputTimeRangeField']}
      >
        <SingleInputTimeRangeField label="From - To" sx={{minWidth:250}} />
      </DemoContainer>
    </LocalizationProvider>
    );
  };


  // const TimeRangeField = () => {
  //   return (
  //     <LocalizationProvider dateAdapter={AdapterDayjs}>
  //       <SingleInputTimeRangeField label="From - To" sx={{ minWidth: 250 }} />
  //     </LocalizationProvider>
  //   );
  // };


  function DayCard({ day,intervals, setIntervals }) {
  
    const handleAddInterval = () => {
      if (intervals.length < 3) {
        const newId = intervals.length > 0 ? intervals[intervals.length - 1].id + 1 : 1;
        setIntervals([...intervals, { id: newId }]);
      }
    };

    const handleDeleteInterval = (id) => {
      const updatedIntervals = intervals.filter((interval) => interval.id !== id).map((interval, index) => ({ ...interval, id: index + 1 }));
      setIntervals(updatedIntervals);
    };

    return (
      <div className='daycard-container'>
        <h3 className='daycard-heading'>
          <span>{day}</span>
        </h3>
        {intervals.map((interval) => (
        <div className='daycard-rows' key={interval.id}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <TimeRangeField /> &nbsp; &nbsp; &nbsp; <EmailsSelection />
            <CloseIcon onClick={() => handleDeleteInterval(interval.id)} sx={{color:'red',marginLeft:2, cursor:'pointer'}}/>
          </span>
        </div>
      ))} 
        {intervals.length < 3 && ( 
          <button className='add-interval-btn' onClick={handleAddInterval} disabled={intervals.length >= 3}>Add Interval</button>
        )}
      </div>
    )}


  useEffect(() =>{
    const fetchSendersEmails = async () =>{
      try{
        // const response = await axios.get(`https://crmapi.namekart.com/api/getSenderEmails/${userId}`)
        const response = await fetchSenderEmails(userId)
        setSenderEmails(response.data.result)
      }catch(err){
        console.error('Error in fetching senders emails:', err);
      }
    }
    fetchSendersEmails();
  },[])


  const updateDelay = (stepId, increment) => {

    if(isNewStepId(stepId)){
      const updatedSequences = sequences.map(seq => {
        if (seq.id === activeSequenceTab) { 
          return {
            ...seq,
            steps: seq.steps.map(step => {
              if (step.id === stepId) {
                return {
                  ...step,
                  delay: increment ? step.delay + 1 : Math.max(step.delay - 1, 0) 
                };
              }
              return step;
            })
          }}
        return seq;
      });
      setSequences(updatedSequences);
    }else{
      const updatedSequences = sequences.map(seq => {
        if (seq.id === activeSequenceTab) { 
          return {
            ...seq,
            steps: seq.steps.map(step => {
              if (step.step_id === stepId) {
                return {
                  ...step,
                  delay: increment ? step.delay + 1 : Math.max(step.delay - 1, 0) 
                };
              }
              return step;
            })
          }}
        return seq;
      });
      setSequences(updatedSequences);
    }
  };


  useEffect(() => {
    const fetchSequencesDetails = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/seqDetails`);
        const response = await fetchSequenceDetails()
        console.log(response)
        const fetchedData = response.data.result; 
        const sequencesMap = fetchedData.reduce((acc, currentItem) => {
          
          const {
            sequence_id,
            sequence_name,
            step_id,
            subject,
            pretext,
            body,
            delay
          } = currentItem;
  
          if (!acc[sequence_id]) {
            acc[sequence_id] = {
              id: sequence_id.toString(),
              name: sequence_name,
              isNew: false,
              steps: []
            };
          }
  
          acc[sequence_id].steps.push({
            step_id,
            subject,
            pretext,
            body,
            delay
          });
  
          return acc;
        }, {});
  
        // Convert the map back to an array
        const sequences = Object.values(sequencesMap);
  
        if (sequences.length > 0) {
          setSequences(sequences.map(sequence => ({ ...sequence, isNew: false })));
          setActiveSequenceTab(sequences[0].id);
          
        } else {
          // Handle the case where no sequences are returned
          setSequences([{ id: 'default', name: 'Seq', isEnabled: true,isNew: true,  steps: [{ id:`${activeSequence.id}-${Date.now()}`,
          name:'',
          subject: '',
          pretext: '',
          body: '',
          delay: 3,}] }]);
          setActiveSequenceTab('default');
        }
      } catch (error) {
        console.error('Error fetching sequence details:', error);
      }}
      fetchSequencesDetails();
  }, [campId]); 
  

  const handleDeleteStep = async (sequenceId, stepId) => {
   console.log("sequenceId",sequenceId)
   console.log("stepId",stepId)
    try{
      
      // const deleteResponse = await axios.delete(`https://crmapi.namekart.com/api/deleteStep/${stepId}/${sequenceId}`);
      const deleteResponse = await deleteStep(stepId,sequenceId)
      console.log("response",deleteResponse)
      if (deleteResponse.status === 200){
        // const fetchUpdateSeq = await axios.get(`https://crmapi.namekart.com/api/fetchUpdatedSequences/${sequenceId}`);
        const fetchUpdateSeq = await fetchUpdatedSequence(sequenceId)
        console.log("sequenceResponse", fetchUpdateSeq);

        if (fetchUpdateSeq.status === 200) {
          const fetchedData = fetchUpdateSeq.data;
          console.log("fetchedData", fetchedData)
          const updatedSequence = fetchedData.reduce((acc, currentItem) => {
            const {
                sequence_id,
                sequence_name,
                step_id,
                subject,
                pretext,
                body,
                delay
            } = currentItem;

            if (!acc[sequence_id]) {
                acc[sequence_id] = {
                    id: sequence_id.toString(),
                    name: sequence_name,
                    isNew: false,
                    steps: []
                };
            }

            acc[sequence_id].steps.push({
                id: step_id,
                subject,
                pretext,
                body,
                delay
            });

            return acc;
        }, {}) // Directly access the updated sequence using sequenceId

        // Convert the map back to an array
        const updatedSequences = Object.values(updatedSequence);
        console.log("sequences",updatedSequences)
          // const updatedSequences = sequences.map(sequence => 
          //     sequence.id === sequenceId ? updatedSequence : sequence
          // );

          console.log("updatedSequences", updatedSequences)
          setSequences(updatedSequences);
          setActiveSequenceTab(updatedSequences[0].id);
          if (selectedStep === stepId) {
              setSelectedStep(null);
          }

          setOpenMenu({ sequenceId: null, stepId: null });
      } else {
          console.error("Failed to fetch updated sequence data");
      }
  } else {
      console.error("Failed to delete step on server");
  }
    }catch(err){
      console.log("Error in deleting step",err)
    }
  };
  

  // const handleCheckboxChange = (emailId) => {
  //   setSelectedSenderEmails(prev => {
  //     if (prev.includes(emailId)) {
  //       return prev.filter(id => id !== emailId);
  //     } else {
  //       return [...prev, emailId];
  //     }
  //   });
  // };


  useEffect(() => {     
    const fetchTags = async () => {
      console.log('Fetch tags called')   
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/fetchTags/${userId}`); 
        const response = await fetchTag(userId)
        setTags(response.data.result);   
      } catch (error) {  
        console.error('Error fetching tags:', error); 
      }   
    }; 
    fetchTags();  
  }, []);


  useEffect(() => {
  const fetchSendersNames = async () => {
    if (senderSelected.length > 0) {
      // const queryParam = senderSelected.join(',');
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getSenderNames/${userId}?ids=${senderSelected}`);
        const response = await fetchSenderNames(userId,senderSelected)
        console.log(response);
        setSenderNames(response.data.result);
      } catch (err) {
        console.error('Error in fetching senders names:', err);
      }
    } else {
      setSenderNames([]); // Clear names if no emails are selected
    }
  };
  fetchSendersNames();
}, [senderSelected]); // Depend on selectedSenderEmails to refetch when it changes


  useEffect(()=>{
    console.log('senderSelected: ', senderSelected)
  },[senderSelected])
  
useEffect(()=>{
    console.log('senderName: ', senderNames)
  },[senderNames])

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getEmailsByListId/${titleId}/${userId}`);
        const response = await fetchListData(titleId,userId)
        setEmails(response.data.emails);
        setReceiverName(response.data.names)
        setDomainLink(response.data.links)
        setLeads(response.data.leads)
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    }
    fetchEmails();
  }, [titleId]);


  useEffect(() =>{
    const fetchDomainsNames = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getDomainNames/${titleId}/${userId}`);
        const response = await fetchDomainNames(titleId,userId)
        setDomainNames(response.data.domains);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    }
    fetchDomainsNames();
  },[titleId])


  const columns1 = [
    {
      field: 'email',
      headerName: 'Email', 
      width: 650,
      editable: true,
      
    },
    {
      field: 'status',
      headerName:'Status',
      width: 80,
      editable: true,
      headerAlign:'center',
      align:'center',
      renderCell: (params) => <AcUnitOutlinedIcon />
    },
    {
      field: 'mailProvider',
      headerName:'Mail provider',
      width: 130,
      editable: true,
      headerAlign:'center',
      align:'center',
      renderCell:(params) =>{
        let mailProvider = ''
        if(value1==='1'){
          mailProvider = 'Gmail'
        }else if(value1==='2'){
          mailProvider = 'Zoho'
        }else if(value1==='3'){
          mailProvider = 'Microsoft'
        }else if(value1==='4'){
          mailProvider = 'Unknown'
        }else if(value1==='5'){
          mailProvider = 'Used Contacts'
        }
        return <div>{mailProvider}</div>;
      }
    }
  ];

  const handleCancel = () => {
    setSelectedTag(confirmedTag);
  };


  const handleSaveFilters = async () =>{
    console.log(selectedTag)
    if (selectedTag && selectedTag.title_id) {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getEmailsByListId/${selectedTag.title_id}/${userId}`);
        const response = await fetchListData(selectedTag.title_id,userId)
        setEmails(response.data.emails); 
        setDomainNames(response.data.domains)
        setConfirmedTag(selectedTag);
        setSelectedTag(null);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    }
  } 

  const rows1 = emails.map((email, index) => ({
    id: index,
    email,  
    status:'',
    mailProvider:''
    
  }));

  const columns2 = [
    {field: 'senderEmails', headerName: 'Sender Emails', width: 400, headerAlign: 'center', align:'center'}
  ]

  const rows2 = senderEmails.map((emailObj,index)=>({
    id:index,
    senderEmails:emailObj.sender_email_id,
  }))

  const headerStyle = {
    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: '650',
        fontSize:'19px',
        fontFamily:'Nunito Sans'  
    }
  };

  const handleTagChange = (e) => {
    const selectedValue = e.target.value;
    const selectedTagObject = tags.find(tag => tag.tags === selectedValue) || {};
    setSelectedTag(selectedTagObject);
  };


  const isNewStepId = (stepId) => {
    const stepsId = String(stepId)
    return stepsId.includes('-');
  };


  const handleStepClick = (stepId) => {
    console.log("stepId",stepId)

    if(isNewStepId(stepId)){
      console.log(stepId)
      const containingSequence = sequences.find(seq => seq.steps.some(s => s.id === stepId)); 
      console.log(containingSequence)
      if (!containingSequence) return;
   
      const chosenStep = containingSequence.steps.find(s => s.id=== stepId);
      if (!chosenStep) return;
    
      setSelectedStep(stepId);
      setIsLoadingEmailTemplate(true);
  
      setTimeout(() => {
        setIsLoadingEmailTemplate(false); 
      }, 200);

    }else{
      console.log(stepId)
      const containingSequence = sequences.find(seq => seq.steps.some(s => s.step_id === stepId));
      if (!containingSequence) return;
 
      const chosenStep = containingSequence.steps.find(s => s.step_id=== stepId);
      if (!chosenStep) return;
  
      setSelectedStep(stepId);
      setIsLoadingEmailTemplate(true);

      setTimeout(() => {
        setIsLoadingEmailTemplate(false); 
      }, 200);
    }

  };
 


  const handleStepChange = (sequenceId, stepId, field, value) => {
    if(isNewStepId(stepId)){

      setSequences((prevSequences) => {
        return prevSequences.map((sequence) => {
          if (sequence.id !== sequenceId) return sequence; 
          const updatedSteps = sequence.steps.map((step) => {
            if ((step.id)  !== stepId) return step; 
            if (step[field] === value) return step;
            return { ...step, [field]: value };
          });
          return { ...sequence, steps: updatedSteps };
        });
      });

    }else{

      setSequences((prevSequences) => {
        return prevSequences.map((sequence) => {
          if (sequence.id !== sequenceId) return sequence; 
          const updatedSteps = sequence.steps.map((step) => {
            if ((step.step_id)  !== stepId) return step; 
            if (step[field] === value) return step;
            return { ...step, [field]: value };
          });
          return { ...sequence, steps: updatedSteps };
        });
      });

    }
  };
  
  
  const addEmailStepToSequence = (sequenceId) => {
    const updatedSequences = sequences.map(seq => {
      if (seq.id === sequenceId) {
        const newStep = {
          subject: '',
          pretext: '',
          body: '',
          delay: 3,
          id: `${sequenceId}-${Date.now()}`,
          name: `FollowUp ${seq.steps.length}`,
        };
        return { ...seq, steps: [...seq.steps, newStep] };
      }
      return seq;
    });
    console.log(updatedSequences)
    setSequences(updatedSequences);
  }; 



  const handleChange = (event, newValue) => {
    setValue(newValue);
    if(value!=='4'){
      setShowInputBoxes(false);  
    }
  };

  const handleChange1 = (event,newValue ) =>{
    setValue1(newValue)
  }

  const handleChange2 = (event,newValue ) =>{
    setValue2(newValue)
  }

  const handleBackToCampaign = (e) =>{
    e.preventDefault()
    navigate('/home/manualCampaigns')
  }

  const deleteCampaign = async (e) => {
    e.preventDefault()
    try{
      // const response = await axios.delete('https://crmapi.namekart.com/api/deleteCampaign',{
      //   data: { campId: campId } 
      // })
      const response = await deleteCampaigns(campId)
      console.log('Delete response',response) 
      navigate('/home/manualCampaigns');

    }catch(err){
      console.log('Error in deletion of campaign',err);
    }
  };

  useEffect(()=>{
    console.log('domainNames',domainNames)
  },[domainNames])


  const startCampaign = async () => {
    
    try{
      const sequenceToSend = sequences.find(seq => seq.id === activeSequenceTab);
      let cumulativeDelay = 0;
      updateCampaignStatus(campId, "running");

      for (let i = 0; i < sequenceToSend.steps.length; i++) {
        const step = sequenceToSend.steps[i];

        console.log(step)
        const campaignData = {
          receiversEmails: emails, 
          sendersEmails: senderSelected,
          senderNames: senderNames,
          receiverName:receiverName,
          leads:leads,
          subject: step.subject,
          pretext: step.pretext,
          emailBody: step.body,
          delay: cumulativeDelay, 
          domains:domainNames,
          campId: campId,
          stepCount:i+1,
          domainLinks: domainLink,
          userId:userId,
          campRunningType:"simpleCampaign"
        };

        navigate('/home/manualCampaigns',{ replace: true })
        // const response = await axios.post('https://crmapi.namekart.com/api/startCampaign', campaignData);
        const response = await startCampaigns(campaignData);
        setIsFirstEmail(false)
        console.log("Response:", response);  
        cumulativeDelay = step.delay;
      }
      
      updateCampaignStatus(campId, "completed");

    }catch(err){
      updateCampaignStatus(campId, "interrupted");
        console.error('Error in starting campaign:', err);
    }
  };

  useEffect(() => {
    fetchCampaignStatus(campId).then(status => {
      setIsCampaignRunning(status === "running");
    }).catch(error => {
      console.error("Failed to fetch campaign status:", error);
      setIsCampaignRunning(false); 
    });
  }, [campId]);
  


  return (
  <div style={{ position: 'relative' }}>
    {snapshotEffect && (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            transition: 'opacity 0.5s'
        }} />
    )}

    <div className="mailing-page">
      <div onClick={handleBackToCampaign} className="mailing-navigation">
            ← Campaigns
      </div>  

      <div className='mailing-header'>  
        <h1>{campName}</h1>  
        <div className="mailing-controls">     
          <button onClick={deleteCampaign} className='delete' disabled={isCampaignRunning}>Delete campaign</button>
          <button onClick={startCampaign} disabled={isCampaignRunning} className='start-campaign'>Start Campaign</button>
        </div> 
      </div> 
      
  <div className="mailing-tabs">
      <TabContext value={value}>
          <TabList onChange={handleChange} aria-label="lab API tabs example"
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
            }}/>
            <Tab label="Mail" value="2" className={classes.tab} 
            sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
            <Tab label="Schedule" value="3" className={classes.tab} 
            sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
            <Tab label="Sequence" value="4" className={classes.tab} 
            sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
          </TabList>

    <TabPanel value="1">
        <div className="contact-info">
          <h3>Contact filters</h3>
          <Box 
            sx={{ 
              width: '50%', 
              padding: '20px', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start' 
            }}
          >
          <FormControl fullWidth>
          <InputLabel id="tag-select-label">Select tag</InputLabel>
          <Select
          labelId="tag-select-label"
          id="tag-select"
          value={selectedTag ? selectedTag.tags : ""}
          label="Select tag"
          onChange={handleTagChange}
          renderValue={
            selectedTag !== null
              ? undefined
              : () => <span style={{ color: "#aaa" }}>Select tag</span>
          }
          >
            <MenuItem value="">
            </MenuItem>
                {tags.length>0 ? (
                    tags.map((tagItem, index) => (
                      <MenuItem key={index} value={tagItem.tags}>{tagItem.tags}</MenuItem>
                    ))
                  ) :(
                <option>Loading tags...</option>
            )}
          </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              disabled={selectedTag === null || JSON.stringify(selectedTag) === JSON.stringify(confirmedTag)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveFilters}
              disabled={selectedTag === null || JSON.stringify(selectedTag) === JSON.stringify(confirmedTag)}
            >
              Save filters
            </Button>
          </Box>
        </Box>
        <div className='contacts-previews' style={{marginTop:'100px'}}>
            <h2>Contacts preview</h2>
            <p>Segments are processed asynchronously and it may take some time for contact to pop up in preview.</p>
            <TabContext value={value1}>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexWrap: 'wrap'}}>
                <TabList onChange={handleChange1} 
                aria-label="lab API tabs example"
              sx={{  
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }} 
              className={classes.tabList}
              >
                <Tab label="Gmail (0)" value="1" className={classes.tab} sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
                <Tab label="Zoho (0)" value="2" className={classes.tab} sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
                <Tab label="Microsoft (0)" value="3" className={classes.tab} sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
                <Tab label="Unknown (0)" value="4" className={classes.tab} sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
                <Tab label="Used Contacts (0)" value="5" className={classes.tab} sx={{
              '&:not(.Mui-selected):hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              }
            }}/>
              </TabList>
            </div>

              <TabPanel value='1'>
                <TabContext value={value2}>
                  <div style={{width:'1000px', marginLeft:'20px'}}>
                    <TabList onChange={handleChange2} aria-label="lab API tabs example">
                      <Tab label="Contacts" value='1' />
                      <Tab label="Metrics" value='2' />
                    </TabList>
                  </div>
                <TabPanel value='1'>
                  <div style={{ height: 400, width: '90%', marginTop:'40px' }}>
                    <DataGrid  
                      rows={rows1} 
                      columns={columns1}
                      pageSize={5}
                      sx={headerStyle}
                    />
                  </div>   
                </TabPanel>
                <TabPanel value='2'>
                  Metrics
                </TabPanel>
                </TabContext>
              </TabPanel>
            </TabContext>
        </div>
      </div>    
        </TabPanel>
        <TabPanel value="2">
          <div className='mails-info'>
            <h2>Mail accounts to send emails</h2>
            <p style={{color:selectedEmails2.length>0 ? 'green' : 'red'}}>Selected {selectedEmails2.length} accounts for sending</p>
            <div style={{ height: 400, width: '50%' }}>
            <DataGrid
                rows={rows2}
                columns={columns2}
                pageSize={5}
                checkboxSelection
                disableSelectionOnClick 
                rowSelectionModel = {selectedEmails2}
                onRowSelectionModelChange ={(newSelectionModel) => {
                  console.log('Current selectedEmails2:', selectedEmails2);
                  console.log('New Selection Model:', newSelectionModel);
                  const selectedEmails = newSelectionModel.map((index) => rows2[index]?.senderEmails || '');
                  setSenderSelected(selectedEmails)
                  setSelectedEmails2(newSelectionModel);
                }}
                sx = {headerStyle}
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel value="3">

          <div className='schedule-contanier'>
              <h2>Select schedule settings</h2>
              
              <div className='schedule-cards'>
                 <Card className={`card-container ${selectedCard === 0 ? 'selected' : ''}`} onClick={() => handleCardClick(0)} sx={{ width:750, height:180}}>
                    <CardContent>
                      <Typography sx={{fontWeight:550, marginLeft:15}} variant='h6' component="div">
                          Working hours
                      </Typography>
                      <Typography sx={{ fontSize: 18, marginTop: 1, display:'flex' }} color="text.secondary" gutterBottom>
                        <CheckCircleOutlineOutlinedIcon/> &nbsp; Monday to friday
                      </Typography>
                      <Typography sx={{ fontSize: 18, marginTop: 1, display:'flex' }} color="text.secondary" gutterBottom>
                        <CheckCircleOutlineOutlinedIcon/> &nbsp; 8am to 1pm. 15 emails/mail account
                      </Typography>
                      <Typography sx={{ fontSize: 18, marginTop: 1, display:'flex' }} color="text.secondary" gutterBottom>
                        <CheckCircleOutlineOutlinedIcon/> &nbsp; 2pm to 7pm. 20 emails/mail account
                      </Typography>
                    </CardContent>
                 </Card>

                 <Card  className={`card-container ${selectedCard === 1 ? 'selected' : ''}`} 
                //  onClick={() => handleCardClick(1)} 
                 sx={{ width:750, height:180}}>
                    <CardContent>
                      <Typography sx={{fontWeight:550, marginLeft:15}} variant='h6' component="div">
                          Custom
                      </Typography>
                      <Typography sx={{ fontSize: 18, marginTop: 1, display:'flex' }} color="text.secondary" gutterBottom>
                        <CheckCircleOutlineOutlinedIcon/> &nbsp; You select days, time intervals and sending speed.
                      </Typography>
                    </CardContent>
                 </Card>

              </div>

              <div className='card-details'>
                {selectedCard === 0 && (
                  <div>
                    {/* Details related to the first card */}
                  </div>
                )}
                {selectedCard === 1 && (
                  <div className='custom-card'>
                      <DayCard className="daycard" day="Monday" intervals={intervals} setIntervals={setIntervals} />

                      <DayCard className="daycard" day="Tuesday" intervals={intervals} setIntervals={setIntervals} />

                      <DayCard className="daycard" day="Wednesday" intervals={intervals} setIntervals={setIntervals} />

                      <DayCard className="daycard" day="Thursday" intervals={intervals} setIntervals={setIntervals} />

                      <DayCard className="daycard" day="Friday" intervals={intervals} setIntervals={setIntervals} />

                      <DayCard className="daycard" day="Saturday" intervals={intervals} setIntervals={setIntervals} />

                      <DayCard className="daycard" day="Sunday" intervals={intervals} setIntervals={setIntervals} />
                  </div>
                )}
              </div>
          </div>
      </TabPanel>



<TabPanel value="4">

<TabContext value={activeSequenceTab}>

  <Box >
    <TabList
      onChange={(event, newValue) => setActiveSequenceTab(newValue)}
      aria-label="sequence tabs example"
      variant="scrollable"
      scrollButtons="auto"
      className={classes1.tabList }
    > 
      {sequences.map((sequence) => (
    <Tab 
      label={sequence.name || 'Unnamed Sequence'} 
      value={sequence.id.toString()} 
      key={sequence.id} 
      className={classes1.tab}
      sx={{
        '&:not(.Mui-selected):hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        minWidth: '80px !important',
        fontSize: '15px !important',
      }}
    />
  ))}
    </TabList>
  </Box>
  
<Box sx={{ display: 'flex', justifyContent: 'flex-start', padding: 2,  }}>
  <Tooltip title="Edit the current sequence">
    <Button
      color="primary"
      onClick={() => {
        editSequence(activeSequenceTab);
      }}
      sx={{ marginRight: 1, fontSize: '0.85rem', padding: '5px 10px', color:'green',fontWeight:'800',fontFamily:'Nunito Sans'  }} 
    >
      Edit Sequence
    </Button>
  </Tooltip>


  <Tooltip title={sequences.length >= 5 ? "Single campaign can have upto 5 sequences" : "Create one more sequence"}>
    <span>
    <Button
      color="primary"
      onClick={() => {
        const newId = uuidv4();
        const newName = 'Seq'; 

        setSequences([
          ...sequences,
          { id: newId, name: newName, isEnabled: true, isNew:true, steps: [{id:`${newId}-${Date.now()}`, name:'', body: '', subject: '', pretext: '', delay: 3 }] },
        ]);
        setActiveSequenceTab(newId); 
      }}

      sx={{ fontSize: '0.85rem', padding: '5px 10px',color:'black',fontWeight:'bold', fontFamily:'Nunito Sans',color:'green' }}
      disabled={sequences.length >= 5} 
    >
      Add Sequence
    </Button> 
    </span>
  </Tooltip>
  </Box>
</TabContext>


<EditSequenceDialog
      open={isEditSequenceDialogOpen}
      sequence={currentSequence}
      onSave={handleSaveSequence}
      onCancel={handleCancelEdit}
      onDelete={() => handleDeleteSequence(activeSequence.id)}
      onToggleEnabled={() => toggleSequenceEnabled(currentSequence.id)}
      sequencesLength={sequences.length}
/>

  <div className="sequence-container">
    <div className="sequence-steps">
      {activeSequence && activeSequence.steps.map((step, index) => (
    <React.Fragment key={step.id || step.step_id}>
      <div className="email-step-box" onClick={() => handleStepClick(step.id || step.step_id)} style={{cursor:'pointer'}}>
        <div className="email-step-header">
          <div className="email-step-header-left">
            <EmailIcon className="icon" />
            {step.name || (index === 0 ? 'First email' : `Follow up ${index }`)}
          </div>

          <div className="email-step-header-right">
            {!step.body || step.body.trim() === '' ? (
              <ErrorOutlineIcon className='error-icon icon' style={{color:'red'}} />
            ) : null}

            <MoreVertIcon
              className='more-icon icon'
              onClick={(e) => handleMenuClick(e, activeSequence.id, step.step_id || step.id)}
            />

            {openMenu?.sequenceId === activeSequence.id && openMenu?.stepId === (step.step_id || step.id) && (
              <div className="menu-options" onClick={(e) => e.stopPropagation()}>
                <div className="menu-item" onClick={() => startRename(activeSequence.id, step.id)}><DriveFileRenameOutlineTwoToneIcon/> &nbsp; Rename</div>
                <div className="menu-item" onClick={() => {/* handleEditStep(sequence.id, step.id) */}}><ModeEditIcon/> &nbsp; Edit this step</div>
                <div className="menu-item" onClick={() => handleDeleteStep(activeSequence.id, step.step_id || step.id)}><ClearIcon style={{color:'red'}}/> &nbsp; Delete this step</div>
              </div>
            )}
          </div>
        </div>
        
        {(selectedStep === step.id || selectedStep === step.step_id) && 
        <>
        {isLoadingEmailTemplate ? (<div>Loading...</div>) :
          (<div className="email-inputs-container">
                  <>
                    <TextField
                      label="Subject"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={step.subject || ''}
                      onChange={(e) => handleStepChange(activeSequence.id, step.step_id || step.id, 'subject', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={index !== 0}
                    />

                    {index !== 0 && (
                      <div style={{ fontSize: '0.98rem', color: '#606060', marginLeft:'8px',marginTop:'-8px',fontWeight:'500' }}>
                        Subject not needed for follow up, it's always Re: [previous subject]
                      </div>
                    )}
                    <CharacterCount text={step.subject} maxLength={200} />
                  </>
        
                  <>
                    <TextField
                      label="Pretext"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={step.pretext || ''}
                      onChange={(e) => handleStepChange(activeSequence.id, step.step_id || step.id, 'pretext', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <CharacterCount text={step.pretext} maxLength={200} />
                  </>
        
                  <>

                  <div onClick={(e) => e.stopPropagation()}>     
                    <ReactQuill
                      className='my-quill-editor'
                      theme="snow"
                      value={step.body || ''}
                      onChange={(content) => handleStepChange(activeSequence.id, step.step_id || step.id, 'body', content)}
                    />
                  </div>
                    <CharacterCount text={cleanAndCountText(step.body)} maxLength={500} />
                  </>
                </div>  
          )}
        </>
        }
      </div>

      {index < activeSequence.steps.length - 1 && (
      <div style={{display:'flex', alignItems:'center'}}>
        <IconButton onClick={() => updateDelay(step.step_id || step.id, false)} size="small">
          <RemoveIcon />
        </IconButton>

        <Typography variant="body2" style={{ margin: '0 10px' }}>
          Wait for {step.delay} days
        </Typography>

        <IconButton onClick={() => updateDelay(step.step_id || step.id, true)} size="small">
          <AddIcon />
        </IconButton>
      </div>
    )}
    
    </React.Fragment>
  ))}

          <RenameDialog
              open={isRenameDialogOpen}
              onClose={() => setIsRenameDialogOpen(false)}
              initialName={renamingStepIndex !== null ? emailSteps[renamingStepIndex].name || `Step ${renamingStepIndex + 1}` : ''}
              onSave={(newName) => {
                const updatedSteps = emailSteps.map((step, idx) =>
                  idx === renamingStepIndex ? { ...step, name: newName } : step
                );
                setEmailSteps(updatedSteps);
                setIsRenameDialogOpen(false);
                setRenamingStepIndex(null);
              }}
          />
          </div>

          <div className="sequence-controls">
            <button onClick={() => addEmailStepToSequence(activeSequence.id)} className="add-step-button">Add Step</button>
                <button className="save-sequence-button" 
                style={{cursor:'pointer'}} 
                onClick={saveSequence}
                disabled={!sequences.find(seq => seq.id === activeSequenceTab)?.isNew}
                >
                Save Sequence
            </button>

            <button onClick={handleUpdateSequence} 
            style={{cursor:'pointer'}}
            disabled={sequences.find(seq => seq.id === activeSequenceTab)?.isNew}
            className='update-sequence-button'
            >Update
            </button>
          </div>
        </div>

      </TabPanel>
    </TabContext>
    
  </div>
</div>

      <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
        />
</div>
            
)}


export default MailingCampaigns;
