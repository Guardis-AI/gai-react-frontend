import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Events() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(null);
  const [events, setEvents] = useState(null);
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
        console.log(response);
        response = response.data.gai_get_user_notification_log[0];
        if (response == null) {
          console.log("No events found!");
        } else {
          setUnreadCount(response.message_count);
          setEvents(response.notification_log);
          if (state) {
            setCurrVidUrl(state.url);
            setCurrNoti(state.id);
          } else {
            setMainVideo(
              response.notification_log[0].notification_log_id,
              response.notification_log
            );
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate, state]);

  function setMainVideo(id, notifs) {
    if (state) {
      setCurrVidUrl(state.url);
      setCurrNoti(state.id);
      return;
    }
    let selNoti;
    if (notifs) {
      selNoti = notifs.find((i) => i.notification_log_id === id);
    } else {
      selNoti = events.find((i) => i.notification_log_id === id);
    }

    const streamUrl =
      localStorage.getItem("cfUrl") + "get_video?path=" + selNoti.filepath;
    setCurrVidUrl(streamUrl);
    setCurrNoti(selNoti);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center">
          <div className="flex justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white font-semibold">
            <h6>{currNoti?.noti_camera_type}</h6>
            <h6>{currNoti?.sent_date}</h6>
          </div>
          <ReactPlayer
            url={currVidUrl}
            width="100%"
            // height="100%"
            controls
          />
          <div className="flex mt-2 space-x-2 justify-end">
            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={() => console.log("up")}
            >
              <ThumbUpIcon />
            </button>
            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={() => console.log("down")}
            >
              <ThumbDownIcon />
            </button>
          </div>
        </div>
      </div>
      <EventList
        unreadCount={unreadCount}
        events={events}
        setMainVideo={setMainVideo}
      />
    </div>
  );
}
