// Navbar.js
import React, { useContext } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popper,
  Paper,
  ClickAwayListener,
  Grow,
  Stack,
  Toolbar,
  Tooltip,
  MenuList,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import { updateEmailCategory } from "../services/updateEmailCategory ";
import ContactsIcon from "@mui/icons-material/Contacts";
import CampaignIcon from "@mui/icons-material/Campaign";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import MediationIcon from "@mui/icons-material/Mediation";
import VerticalShadesClosedIcon from "@mui/icons-material/VerticalShadesClosed";
import MenuTwoToneIcon from "@mui/icons-material/MenuTwoTone";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MessageIcon from "@mui/icons-material/Message";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import Namekart from "./Namekart";
import "../style/Navbar.css";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import { Outlet, useNavigate } from "react-router";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { GlobalContext } from "./ContextApi/GlobalContext"; // Import GlobalContext
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";


function Home() {
  const [open, setOpen] = React.useState(true);
  const [openPopper, setOpenPopper] = React.useState(false);
  const [nestedOpen1, setNestedOpen1] = React.useState(false);
  const [nestedOpen2, setNestedOpen2] = React.useState(false);
  const [emailMenuAnchorEl, setEmailMenuAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(GlobalContext); // Use GlobalContext

  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate("/login"); // Redirect to login page
  };

  const handleDrawerToggle = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen(open);
  };

  const handleEmailMenuClick = (event) => {
    navigate("/home/userEmails");
  };

  const toggleNestedMenu1 = () => {
    if (!open) setOpen(true);
    setNestedOpen1(!nestedOpen1);
  };

  const toggleNestedMenu2 = () => {
    if (!open) setOpen(true);
    setNestedOpen2(!nestedOpen2);
  };

  const drawerWidth = 250;

  const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  });

  const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
  });

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 1.5),
    minHeight: 64,
    backgroundColor: "black",
  }));

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  return (
    <Box sx={{ backgroundColor: "white", height: "100vh" }}>
      <Stack direction="column">
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            position="fixed"
            elevation={0}
            open={open}
            sx={{ backgroundColor: "black" }}
          >
            <Toolbar
              variant="regular"
              disableGutters
              sx={{ paddingLeft: "30px", paddingRight: "30px" }}
            >
              {
                <IconButton
                  size="large"
                  edge="start"
                  color="secondary"
                  aria-label="open drawer"
                  onClick={handleDrawerToggle(true)}
                  sx={{
                    marginRight: 5,
                    ...(open && { display: "none" }),
                  }}
                >
                  <MenuTwoToneIcon />
                </IconButton>
              }

              <Box sx={{ flexGrow: 1 }}></Box>
              <Tooltip title="Notification">
                <IconButton
                  size="large"
                  edge="start"
                  onClick={() => {
                    navigate("#");
                  }}
                  aria-label="menu"
                  sx={{ mr: 1, color: "#6174D7" }}
                >
                  <NotificationsOutlinedIcon
                    sx={{ width: 30, height: 30, color: "white" }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Emails">
                <IconButton
                  size="large"
                  edge="start"
                  aria-label="email-menu"
                  aria-haspopup="true"
                  sx={{ mr: 0.1, color: "#6174D7" }}
                  onClick={handleEmailMenuClick}
                >
                  <EmailOutlinedIcon
                    sx={{ width: 30, height: 30, color: "white" }}
                  />
                </IconButton>
              </Tooltip>

              {isAuthenticated && (
                <Tooltip title="Logout">
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="logout"
                    onClick={handleLogout}
                    sx={{ color: "#6174D7" }}
                  >
                    <ExitToAppOutlinedIcon
                      sx={{ width: 30, height: 30, color: "white" }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Toolbar>
          </AppBar>
        </Box>
        <Drawer
          PaperProps={{
            sx: {
              "&::-webkit-scrollbar": {
                width: "6px", // Set the desired width for the scrollbar
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888", // Set the color of the scrollbar thumb
                borderRadius: "6px", // Set the border radius of the scrollbar thumb
              },
              background: "#191919",
              color: "#cac4d0",
            },
          }}
          variant="permanent"
          open={open}
          onClose={handleDrawerToggle(false)}
        >
          <DrawerHeader>
            <Namekart />
          </DrawerHeader>
          <List
            sx={{
              width: "100%",
              color: "#CAC4D0",
              fontSize: 14,
              fontFamily: "sans-serif",
              fontWeight: "500",
              lineHeight: 20,
              letterSpacing: 0.1,
              wordWrap: "break-word",
            }}
          >
            <ListItem button onClick={() => navigate("/home/contacts")}>
              <ListItemIcon sx={{ color: "#cac4d0" }}>
                <ContactsIcon />
              </ListItemIcon>
              <ListItemText primary="Contacts" />
            </ListItem>

            <Divider sx={{ backgroundColor: "#49454F" }} variant="middle" />

            <ListItem button onClick={() => navigate("/home/manualCampaigns")}>
              <ListItemIcon sx={{ color: "#cac4d0" }}>
                <CampaignIcon />
              </ListItemIcon>
              <ListItemText primary="Manual Campaigns" />
            </ListItem>

            <Divider sx={{ backgroundColor: "#49454F" }} variant="middle" />

            <ListItem button onClick={() => navigate("/home/campaignStatus")}>
              <ListItemIcon sx={{ color: "#cac4d0" }}>
                <PauseCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Stats" />
            </ListItem>

            <Divider sx={{ backgroundColor: "#49454F" }} variant="middle" />

            <ListItem button onClick={() => navigate("/home/chattingMessages")}>
              <ListItemIcon sx={{ color: "#cac4d0" }}>
                <MessageIcon />
              </ListItemIcon>
              <ListItemText primary="Old-Messages" />
            </ListItem>

            <Divider sx={{ backgroundColor: "#49454F" }} variant="middle" />

            <ListItem button onClick={toggleNestedMenu2}>
              <ListItemIcon sx={{ color: "#cac4d0" }}>
                <MessageIcon />
              </ListItemIcon>
              <ListItemText primary="Messages" />
              {nestedOpen2 ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </ListItem>

            {nestedOpen2 && (
              <List>
                <ListItem
                  button
                  onClick={() => navigate("/home/messages/manualmail")}
                >
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <ShieldOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manual" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => navigate("/home/messages/bulkmail")}
                >
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <GavelIcon />
                  </ListItemIcon>
                  <ListItemText primary="Bulk" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => navigate("/home/messages/livedetectmail")}
                >
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <MonetizationOnIcon />
                  </ListItemIcon>
                  <ListItemText primary="Live Detect" />
                </ListItem>
              </List>
            )}

            <Divider sx={{ backgroundColor: "#49454F" }} variant="middle" />

            <ListItem button onClick={toggleNestedMenu1}>
              <ListItemIcon sx={{ color: "#cac4d0" }}>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Categories" />
              {nestedOpen1 ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </ListItem>

            {nestedOpen1 && (
              <List>
                <ListItem button onClick={() => navigate("/declined")}>
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <ThumbDownOffAltIcon />
                  </ListItemIcon>
                  <ListItemText primary="Declined" />
                </ListItem>

                <ListItem button onClick={() => navigate("/pq")}>
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <MonetizationOnIcon />
                  </ListItemIcon>
                  <ListItemText primary="PQ" />
                </ListItem>

                <ListItem button onClick={() => navigate("/negotiation")}>
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <MediationIcon />
                  </ListItemIcon>
                  <ListItemText primary="Negotiation" />
                </ListItem>

                <ListItem button>
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <VerticalShadesClosedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Closed" />
                </ListItem>

                <ListItem button onClick={() => navigate("/privacyPolicy")}>
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <ShieldOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Privacy Policy" />
                </ListItem>

                <ListItem button onClick={() => navigate("/termsAndServices")}>
                  <ListItemIcon sx={{ color: "#cac4d0" }}>
                    <GavelIcon />
                  </ListItemIcon>
                  <ListItemText primary="Terms Of Services" />
                </ListItem>
              </List>
            )}
          </List>
        </Drawer>
      </Stack>
      <Box
        // height="100%"

        sx={{
          height: 'calc(100vh - 164px)',
          marginLeft: `${drawerWidth}px`,
          paddingLeft: "90px",
          paddingRight: "35px",
          paddingTop: "80px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Home;
