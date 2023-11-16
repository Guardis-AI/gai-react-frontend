import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import VideocamIcon from "@mui/icons-material/Videocam";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

export const navData = [
  {
    id: 0,
    icon: <HomeIcon />,
    text: "Home",
    link: "/",
  },
  {
    id: 1,
    icon: <SettingsIcon />,
    text: "Setup",
    link: "setup",
  },
  {
    id: 2,
    icon: <VideocamIcon />,
    text: "Live",
    link: "live",
  },
  {
    id: 3,
    icon: <PlayCircleOutlineIcon />,
    text: "Playback",
    link: "playback",
  },
  {
    id: 4,
    icon: <NotificationsIcon />,
    text: "Events",
    link: "events",
  },
  {
    id: 5,
    icon: <LogoutIcon />,
    text: "Sign Out",
    link: "sign-out",
  },
];
