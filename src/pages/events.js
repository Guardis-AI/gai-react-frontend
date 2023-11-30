import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import moment from "moment";
import UserFeedbackModal from "../components/UserFeedbackModal";

const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Events() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(null);
  const [events, setEvents] = useState(null);
  const [currNoti, setCurrNoti] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);
  const [cameraList, setCameraList] = useState(null);
  const { state } = useLocation();
  
  let userFeedbackModal = useRef();

  const setMainVideo = useCallback(
    (id, notifs) => {
      let selNoti;
      
      if (notifs) {
        selNoti = notifs.find((i) => i.clip_id === id);
      } else {
        selNoti = events.find((i) => i.clip_id === id);
      }

      const streamUrl = `${localStorage.getItem(
        "cfUrl"
      )}notifications/get_video/${selNoti.clip_id}`;
      setCurrVidUrl(streamUrl);
      setCurrNoti(selNoti);
    },
    [events, state]
  );

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    if (cameraList === null || cameraList.length == 0) {
      axios
        .get(localStorage.getItem("cfUrl") + "camera/credentials")
        .then(function (response) {
          if (response == null) {
            console.log("No devices found!");
          } else {
            
            const camera_list = response.data.map((camera) => {
              return { uuid: camera.uuid, name: camera.name, mac: camera.mac };
            });

            setCameraList(camera_list);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    axios
      .get(`${localStorage.getItem("cfUrl")}notifications`, null)
      .then(async function (response) {
        if (response == null || response.data.length === 0) {
          console.log("No events found!");
        } else {
          let notification_list = updateCameraNameInNotifications(response.data);

          const notificationUnreadCount = notification_list.filter(
            (n) => n.user_feedback === null
          ).length;

          setTimeout(function () {
            setUnreadCount(notificationUnreadCount);
            setEvents(notification_list);
          }, 5000);

          if (state) {
            if (!currVidUrl) {
              const selNoti = notification_list.find(
                (i) => i.clip_id === state.id
              );

              selNoti.cameraname = state.cameraname;
              setCurrVidUrl(state.url);
              setCurrNoti(selNoti);
            }
          } else {
            if (!currVidUrl) {
              setMainVideo(notification_list[0].clip_id, notification_list);
            }
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate, state, setMainVideo]);


  function updateCameraNameInNotifications(notifications){

    let notification_list = notifications.map((notification) => {
      let cameraname = "Generic";

      if (cameraList !== null) {
        const camera = cameraList.find(
          (c) => c.mac === notification.camera_id
        );
        cameraname = camera ? camera.name : cameraname;
      }

      return {
        clip_id: notification.clip_id,
        camera_id: notification.camera_id,
        cameraname: cameraname,
        sent_date: moment(notification.timestamp).format(
          "MM/DD/yyyy, h:mm:ss A"
        ),
        severity: notification.severity,
        user_feedback: notification.user_feedback,
      };
    });
   
    notification_list = notification_list.sort(
      (a, b) => a.sent_date - b.sent_date
    );

    return notification_list;
  }


  function saveUserFeedback(notification, wasgood) {
    axios
      .put(
        `${localStorage.getItem("cfUrl")}notifications/${notification.clip_id}`,
        {
          clip_id: notification.clip_id,
          camera_id: notification.camera_id,
          severity: notification.severity,
          user_feedback: wasgood,
        }
      )
      .then(function (response) {
        console.log("No devices found!");
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function openFeedbackModal(){
    if (userFeedbackModal.current) {    
      userFeedbackModal.current.openModal();
    }
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center">
          <div className="flex justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white font-semibold">
            <h6>{currNoti?.cameraname}</h6>
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
              onClick={() => saveUserFeedback(currNoti, true)}
            >
              <ThumbUpIcon />
            </button>
            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick= {()=>openFeedbackModal()}//{() => saveUserFeedback(currNoti, false)}
            >
              <ThumbDownIcon />
            </button>
          </div>
        </div>
      </div>
      <EventList
        unreadCount={unreadCount}
        events={events}
        setMainVideo={setMainVideo}s
      />
      <UserFeedbackModal ref={userFeedbackModal}  />
    </div>
  );
}
