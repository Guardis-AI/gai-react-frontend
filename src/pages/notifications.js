import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import NotificationList from "../components/NotificationList";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Notifications() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [currNoti, setCurrNoti] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);

  const { state } = useLocation();
  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");
    axios
      .post(`${baseUrlApi}/api/noti/getnotilog`, {
        p_user_id: localStorage.getItem("userId"),
        p_device_token: "",
        p_device_type: "",
        p_device_id: "",
        login_user_id: localStorage.getItem("userId"),
        p_notification_log_id: "",
        p_read_flag: "N",
      })
      .then(function (response) {
        response = response.data.gai_get_user_notification_log;
        if (response == null) {
          console.log("No notifications found!");
        } else {
          setUnreadCount(response[0].message_count);
          setNotifications(response[0].notification_log);
          if (state) {
            setCurrVidUrl(state.url);
            setCurrNoti(state.id);
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate, state]);

  function setMainVideo(id) {
    const selNoti = notifications.find((i) => i.notification_log_id === id);

    const streamUrl =
      localStorage.getItem("cfUrl") +
      "get_video?path=" +
      selNoti.filepath +
      "&filename=" +
      selNoti.filename;
    setCurrVidUrl(streamUrl);
    setCurrNoti(id);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center">
          <h6>Notification count: {unreadCount}</h6>
          <h6>{currNoti}</h6>
          <ReactPlayer
            url={currVidUrl}
            width="100%"
            // height="100%"
            controls
          />
        </div>
      </div>
      <NotificationList
        notifications={notifications}
        setMainVideo={setMainVideo}
      />
    </div>
  );
}
