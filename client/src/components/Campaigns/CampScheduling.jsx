// import React, { useState } from 'react';
// import { Checkbox, FormControlLabel, Button, TextField, IconButton, Grid, Typography, Box, Container } from '@mui/material';
// import { Add, Delete } from '@mui/icons-material';

// const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// const CampScheduling = ({ setSchedulingData }) => {
//   const [schedule, setSchedule] = useState({
//     Monday: { active: false, intervals: [] },
//     Tuesday: { active: false, intervals: [] },
//     Wednesday: { active: false, intervals: [] },
//     Thursday: { active: false, intervals: [] },
//     Friday: { active: false, intervals: [] },
//     Saturday: { active: false, intervals: [] },
//     Sunday: { active: false, intervals: [] },
//   });

//   const [errors, setErrors] = useState({});

//   const handleDayChange = (day) => {
//     setSchedule((prev) => ({
//       ...prev,
//       [day]: { ...prev[day], active: !prev[day].active },
//     }));
//   };

//   const addInterval = (day) => {
//     setSchedule((prev) => ({
//       ...prev,
//       [day]: {
//         ...prev[day],
//         intervals: [...prev[day].intervals, { from: '', to: '' }],
//       },
//     }));
//   };

//   const removeInterval = (day, index) => {
//     setSchedule((prev) => {
//       const newIntervals = [...prev[day].intervals];
//       newIntervals.splice(index, 1);
//       return {
//         ...prev,
//         [day]: { ...prev[day], intervals: newIntervals },
//       };
//     });

//     setErrors((prev) => ({
//       ...prev,
//       [day]: prev[day]?.filter((_, i) => i !== index),
//     }));
//   };

//   const handleIntervalChange = (day, index, field, value) => {
//     setSchedule((prev) => {
//       const newIntervals = [...prev[day].intervals];
//       newIntervals[index][field] = value;

//       setErrors((prev) => ({
//         ...prev,
//         [day]: prev[day]?.map((error, i) =>
//           i === index ? { ...error, [field]: '' } : error
//         ),
//       }));

//       return {
//         ...prev,
//         [day]: { ...prev[day], intervals: newIntervals },
//       };
//     });
//   };

//   const validateIntervals = () => {
//     let isValid = true;
//     const newErrors = {};

//     for (const day of daysOfWeek) {
//       if (schedule[day].active) {
//         newErrors[day] = [];

//         if (schedule[day].intervals.length === 0) {
//           newErrors[day] = [{ from: 'At least one interval is required', to: '' }];
//           isValid = false;
//         } else {
//           schedule[day].intervals.forEach((interval, index) => {
//             const error = {};
//             if (!interval.from) {
//               error.from = 'Start time is required';
//               isValid = false;
//             }
//             if (!interval.to) {
//               error.to = 'End time is required';
//               isValid = false;
//             }
//             if (interval.from && interval.to && interval.from >= interval.to) {
//               error.to = 'End time must be after start time';
//               isValid = false;
//             }
//             newErrors[day][index] = error;
//           });
//         }
//       }
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSave = () => {
//     if (validateIntervals()) {
//       const selectedSchedule = Object.entries(schedule)
//         .filter(([_, value]) => value.active && value.intervals.length > 0)
//         .map(([day, value]) => ({
//           day,
//           intervals: value.intervals,
//         }));

//       setSchedulingData(selectedSchedule);
//       alert(JSON.stringify(selectedSchedule, null, 2));
//       console.log(JSON.stringify(selectedSchedule, null, 2));
//     }
//   };

//   return (
//     <Container maxWidth="sm" sx={{ mt: 4 }}>
//       <Typography variant="h4" align="center" gutterBottom>
//         Schedule Campaign
//       </Typography>
//       {daysOfWeek.map((day) => (
//         <Box key={day} mb={4}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={schedule[day].active}
//                 onChange={() => handleDayChange(day)}
//                 sx={{ color: schedule[day].active ? 'primary.main' : 'default' }}
//               />
//             }
//             label={day}
//             sx={{ typography: 'h6' }}
//           />
//           {schedule[day].active && (
//             <Box ml={3}>
//               {schedule[day].intervals.map((interval, index) => (
//                 <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
//                   <Grid item xs={5}>
//                     <TextField
//                       label="From"
//                       type="time"
//                       value={interval.from}
//                       onChange={(e) => handleIntervalChange(day, index, 'from', e.target.value)}
//                       fullWidth
//                       error={!!errors[day]?.[index]?.from}
//                       helperText={errors[day]?.[index]?.from || ''}
//                       sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}
//                     />
//                   </Grid>
//                   <Grid item xs={5}>
//                     <TextField
//                       label="To"
//                       type="time"
//                       value={interval.to}
//                       onChange={(e) => handleIntervalChange(day, index, 'to', e.target.value)}
//                       fullWidth
//                       error={!!errors[day]?.[index]?.to}
//                       helperText={errors[day]?.[index]?.to || ''}
//                       sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}
//                     />
//                   </Grid>
//                   <Grid item xs={2}>
//                     <IconButton onClick={() => removeInterval(day, index)} color="secondary">
//                       <Delete />
//                     </IconButton>
//                   </Grid>
//                 </Grid>
//               ))}
//               {errors[day]?.[0]?.from && (
//                 <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
//                   {errors[day][0].from}
//                 </Typography>
//               )}
//               <Button
//                 variant="outlined"
//                 startIcon={<Add />}
//                 onClick={() => addInterval(day)}
//                 sx={{ mt: 2 }}
//               >
//                 Add Interval
//               </Button>
//             </Box>
//           )}
//         </Box>
//       ))}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleSave}
//         sx={{ mt: 4, display: 'block', mx: 'auto' }}
//       >
//         Save Schedule
//       </Button>
//     </Container>
//   );
// };

// export default CampScheduling;



import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Button, TextField, IconButton, Grid, Typography, Box, Container } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CampScheduling = ({ setSchedulingData }) => {
  const [schedule, setSchedule] = useState({
    Monday: { active: false, intervals: [] },
    Tuesday: { active: false, intervals: [] },
    Wednesday: { active: false, intervals: [] },
    Thursday: { active: false, intervals: [] },
    Friday: { active: false, intervals: [] },
    Saturday: { active: false, intervals: [] },
    Sunday: { active: false, intervals: [] },
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [errors, setErrors] = useState({});

  const handleDayChange = (day) => {
    if (selectedDay && selectedDay !== day) {
      setSchedule((prev) => ({
        ...prev,
        [selectedDay]: { ...prev[selectedDay], active: false, intervals: [] },
      }));
    }

    setSelectedDay(day);
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active, intervals: [] },
    }));
  };

  const addInterval = (day) => {
    if (selectedDay && selectedDay !== day) return;

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: [{ from: '', to: '' }],
      },
    }));
  };

  const removeInterval = (day, index) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], intervals: [] },
    }));

    setErrors((prev) => ({
      ...prev,
      [day]: [],
    }));

    setSelectedDay(null);
  };

  const handleIntervalChange = (day, index, field, value) => {
    setSchedule((prev) => {
      const newIntervals = [...prev[day].intervals];
      newIntervals[index][field] = value;

      setErrors((prev) => ({
        ...prev,
        [day]: prev[day]?.map((error, i) =>
          i === index ? { ...error, [field]: '' } : error
        ),
      }));

      return {
        ...prev,
        [day]: { ...prev[day], intervals: newIntervals },
      };
    });
  };

  const validateIntervals = () => {
    let isValid = true;
    const newErrors = {};

    for (const day of daysOfWeek) {
      if (schedule[day].active) {
        newErrors[day] = [];

        if (schedule[day].intervals.length === 0) {
          newErrors[day] = [{ from: 'Interval is required', to: '' }];
          isValid = false;
        } else {
          schedule[day].intervals.forEach((interval, index) => {
            const error = {};
            if (!interval.from) {
              error.from = 'Start time is required';
              isValid = false;
            }
            if (!interval.to) {
              error.to = 'End time is required';
              isValid = false;
            }
            if (interval.from && interval.to && interval.from >= interval.to) {
              error.to = 'End time must be after start time';
              isValid = false;
            }
            newErrors[day][index] = error;
          });
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateIntervals()) {
      const selectedSchedule = Object.entries(schedule)
        .filter(([_, value]) => value.active && value.intervals.length > 0)
        .map(([day, value]) => ({
          day,
          intervals: value.intervals,
        }));

      setSchedulingData(selectedSchedule);
      // alert(JSON.stringify(selectedSchedule, null, 2));
      alert("Scheduling added successfully");
      console.log(JSON.stringify(selectedSchedule, null, 2));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Schedule Campaign
      </Typography>
      {daysOfWeek.map((day) => (
        <Box key={day} mb={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={schedule[day].active}
                onChange={() => handleDayChange(day)}
                sx={{ color: schedule[day].active ? 'primary.main' : 'default' }}
              />
            }
            label={day}
            sx={{ typography: 'h6' }}
          />
          {schedule[day].active && (
            <Box ml={3}>
              {schedule[day].intervals.map((interval, index) => (
                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                  <Grid item xs={5}>
                    <TextField
                      label="From"
                      type="time"
                      value={interval.from}
                      onChange={(e) => handleIntervalChange(day, index, 'from', e.target.value)}
                      fullWidth
                      error={!!errors[day]?.[index]?.from}
                      helperText={errors[day]?.[index]?.from || ''}
                      sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="To"
                      type="time"
                      value={interval.to}
                      onChange={(e) => handleIntervalChange(day, index, 'to', e.target.value)}
                      fullWidth
                      error={!!errors[day]?.[index]?.to}
                      helperText={errors[day]?.[index]?.to || ''}
                      sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => removeInterval(day, index)} color="secondary">
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              {errors[day]?.[0]?.from && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {errors[day][0].from}
                </Typography>
              )}
              {!schedule[day].intervals.length && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => addInterval(day)}
                  sx={{ mt: 2 }}
                  disabled={!!selectedDay && selectedDay !== day}
                >
                  Add Interval
                </Button>
              )}
            </Box>
          )}
        </Box>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 4, display: 'block', mx: 'auto' }}
      >
        Save Schedule
      </Button>
    </Container>
  );
};

export default CampScheduling;
