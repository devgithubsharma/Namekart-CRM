import React, { useEffect, useState, useContext } from "react";
import "../../style/Contacts.css";
import { Link, Outlet } from "react-router-dom";
import Tab from "@mui/material/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { DataGrid } from "@mui/x-data-grid";
import AcUnitOutlinedIcon from "@mui/icons-material/AcUnitOutlined";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { GlobalContext } from "../ContextApi/GlobalContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { fetchContactList } from "../../api";
import { fetchTag } from "../../api";
import { fetchContactForTag } from "../../api";

const useStyles = makeStyles({
  tab: {
    color: "black",
    marginRight: "20px",
    "&.Mui-selected": {
      backgroundColor: "black",
      color: "white",
      borderRadius: "20px",
    },
  },
  tabList: {
    justifyContent: "center",
    flexWrap: "wrap",
    "& .MuiTabs-flexContainer": {
      justifyContent: "center",
    },
    "& .MuiTabs-indicator": {
      display: "none",
    },
  },
});

const localTheme = createTheme({
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          width: 250,
          maxHeight: 300,
          overflowX: "auto",
        },
      },
    },
  },
});

function Contacts() {
  const [value, setValue] = useState("1");
  const [newEmails, setNewEmails] = useState([]);
  const { userId } = useContext(GlobalContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedTitleId, setSelectedTitleId] = useState("");
  const [selectedTags_id, setSelectedTags_id] = useState("");
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchContactsList = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/getContactList/${userId}`);
        // console.log(response.data.result)
        const response = await fetchContactList(userId);
        setNewEmails(response.data.result);
      } catch (err) {
        console.log("Error in fetching Contacts", err);
      }
    };
    fetchContactsList();
  }, []);

  useEffect(() => {
    const fetchSelectedContacts = async () => {
      try {
        const response = await fetchContactForTag(selectedTags_id);
        console.log("response", response);
        setNewEmails(response.data.results);
      } catch (err) {
        console.log("Error in fetching Contacts", err);
      }
    };
    if(selectedTags_id){
    fetchSelectedContacts();
    }
  }, [selectedTags_id]);

  useEffect(() => {
    console.log("NewEmails", newEmails);
  }, [newEmails]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const tagsResponse = await fetchTag(userId);
        const allTags = tagsResponse.data.result.map((item) => ({
          tags: item.tags,
          tags_id: item.tags_id,
        }));
        setTags(allTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchAllTags();
  }, []);

  useEffect(() => {
    console.log("tags", tags);
  }, [tags]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (tags, tags_id) => {
    setSelectedTag(tags);
    setSelectedTags_id(tags_id);
    setAnchorEl(null);
  };

  const headerStyle = {
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "650",
      fontSize: "18px",
      fontFamily: "Nunito Sans",
    },
  };

  const columns = [
    { field: "Contact", headerName: "Contact", width: 700 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <AcUnitOutlinedIcon />,
    },
  ];

  const rows = [...newEmails].reverse().map((emailObj, index) => ({
    id: index,
    Contact: emailObj.emails,
    status: "",
  }));

  return (
    <div className="contacts">
      <div className="conts-container">
        <TabContext value={value}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            // style={{display:'flex',justifyContent:'center',alignItems:'center'}}
            sx={{
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
            className={classes.tabList}
          >
            <Tab
              label="Contacts"
              value="1"
              className={classes.tab}
              sx={{
                "&:not(.Mui-selected):hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            />
            <Tab
              label="List"
              value="2"
              className={classes.tab}
              sx={{
                "&:not(.Mui-selected):hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)", // or any other color
                },
              }}
            />
            <Tab
              label="Segment"
              value="3"
              className={classes.tab}
              sx={{
                "&:not(.Mui-selected):hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)", // or any other color
                },
              }}
            />
          </TabList>

          <TabPanel value="1">
            <div className="addContacts">
              <div className="addcont-container">
                <div className="addcont">
                  <div className="addcont-left">
                    <Link to="/home/createContacts" className="addcont-items">
                      Add Contacts
                    </Link>
                    <div className="addcont-items">View metrics</div>
                    <div className="addcont-items">
                      Filters
                      <IconButton
                        aria-controls="filter-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                      <ThemeProvider theme={localTheme}>
                        <Menu
                          id="filter-menu"
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => handleClose("", "")}
                          //   sx={{
                          //     width: 500, // Adjust width as needed
                          //     maxHeight: 300, // Adjust maximum height as needed

                          //      // Adds scroll if content exceeds max height
                          // }}
                        >
                          {tags.map((tag) => (
                            <MenuItem
                              key={tag.tags}
                              onClick={() => handleClose(tag.tags, tag.tags_id)}
                            >
                              {tag.tags}
                            </MenuItem>
                          ))}
                        </Menu>
                      </ThemeProvider>
                    </div>
                  </div>

                  <div className="addcont-right">
                    <div className="addcont-items">
                      Learn how to add contacts
                    </div>
                    <div className="addcont-items">Help</div>
                  </div>
                </div>
              </div>
              <div className="contacts-data">
                <div style={{ height: 500, width: "90%" }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    checkboxSelection
                    disableSelectionOnClick
                    sx={headerStyle}
                  />
                </div>
              </div>
            </div>
          </TabPanel>
        </TabContext>
      </div>
    </div>
  );
}

export default Contacts;
