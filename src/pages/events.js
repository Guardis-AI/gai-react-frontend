import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import moment from "moment";
import UserFeedbackModal from "../components/UserFeedbackModal";
import ErrorMessageModal from "../components/ErrorMessageModal";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WarningMessageModal from "../components/WarningMessageModal";

export default function Events() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(null);
  const [events, setEvents] = useState(null);
  const [currNoti, setCurrNoti] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);
  const { state } = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  let userFeedbackModal = useRef();
  let errorMessageModal = useRef();
  let warningMessageModal = useRef();
  let frequencyToGetNotice = useRef(0);
  let cameraList = useRef(null);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

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

  const getCamerasDetails = async ()=>{
   const request =  axios
    .get(localStorage.getItem("cfUrl") + "camera/credentials")
    .then(function (response) {
      if (response == null) {
        console.log("No cameras found!");
      } else {
        const camera_list = response.data.map((camera) => {
          return { uuid: camera.uuid, name: camera.name, mac: camera.mac };
        });

        cameraList.current =camera_list;
      }
    })
    .catch(function (error) {
      console.log(error);
    });

    await request;    
  }

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    if (cameraList.current === null || cameraList.current.length === 0) {
      getCamerasDetails();
    }

    axios
      .get(`${localStorage.getItem("cfUrl")}notifications`, null)
      .then(async function (response) {
        if (response == null || response.data.length === 0) {
          console.log("No events found!");
        } else {
          let notification_list = updateCameraNameInNotifications(
            response.data
          );

          const notificationsUnread = notification_list.filter(
            (n) => n.user_feedback === null
          );

          if (frequencyToGetNotice.current === 0) {
            setUnreadCount(notificationsUnread.length);
            setEvents(notificationsUnread);
            frequencyToGetNotice.current = 60000;
          } else {
            setTimeout(function () {
              setUnreadCount(notificationsUnread.length);
              setEvents(notificationsUnread);
            }, frequencyToGetNotice.current);
          }

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

  const updateCameraNameInNotifications = (notifications) => {
    
    let notification_list = notifications.map((notification) => {
      let cameraname = "Generic";

      if (cameraList.current !== null) {
        const camera = cameraList.current.find((c) => c.mac === notification.camera_id);
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
        notification_type: notification.notification_type,
      };
    });

    if (currNoti && currNoti.cameraname === "Generic") {
      const notification = notification_list.find(
        (n) => n.clip_id == currNoti.clip_id
      );
      setCurrNoti(notification);
    }

    return notification_list;
  };

  const saveUserFeedback = (notification, wasgood) => {
    axios
      .put(
        `${localStorage.getItem("cfUrl")}notifications/${notification.clip_id}`,
        {
          clip_id: notification.clip_id,
          camera_id: notification.camera_id,
          user_feedback: wasgood,
          notification_type: notification.notification_type,
          severity: notification.severity,
        }
      )
      .then(function (response) {
        const notification_list = events.filter(
          (n) => n.camera_id !== response.data.camera_id
        );
        setEvents(notification_list);
        setMainVideo(notification_list[0].clip_id, notification_list);
        setAnchorEl(null);
      })
      .catch(function (error) {
        openErrorModal(error.message);
        console.log(error);
      });
  };

  const deleteNotification = (notification) => {
    axios
      .delete(
        `${localStorage.getItem("cfUrl")}notifications/${notification.clip_id}`,
        null
      )
      .then(function (response) {
        const notification_list = events.filter(
          (n) => n.camera_id !== response.data.camera_id
        );
        setEvents(notification_list);
        setMainVideo(notification_list[0].clip_id, notification_list);
        setAnchorEl(null);
      })
      .catch(function (error) {
        openErrorModal(error.message);
        console.log(error);
      });
  };

  const openFeedbackModal = (currNoti) => {
    if (userFeedbackModal.current) {
      userFeedbackModal.current.openModal(currNoti);
    }
  };

  const handleSaveFeedbackCallback = (result, notificationType, severity) => {
    if (result) {
      currNoti.notification_type = notificationType;
      currNoti.severity = severity;
      saveUserFeedback(currNoti, false);
    }
  };

  const openErrorModal = (message) => {
    if (errorMessageModal.current) {
      setErrorMessage(message);
      errorMessageModal.current.openModal();
    }
  };

  const handleSaveUserFeedbackClick = (event, notification, wasgood) => {
    setAnchorEl(event.currentTarget);
    saveUserFeedback(notification, wasgood);
  };

  const getSeveritiesLabel = (value) => {
    const severities = [
      { label: "Information", value: "INFORMATION" },
      { label: "Information", value: "INFO" },
      { label: "Warning", value: "WARNING" },
      { label: "Critical", value: "CRITICAL" },
    ];

    const severity = severities.find((option) => option.value === value);

    return severity ? severity.label : value;
  };

  const getNotificationTypesLabel = (value) => {
    const notificationTypes = [
      { label: "Item Picking", value: "item_picking" },
      { label: "Bagging", value: "bagging" },
      { label: "Pocketing", value: "pocketing" },
      { label: "Enter Store", value: "enter_store" },
      { label: "Leave Store", value: "leave_store" },
      { label: "Pay Or Checkout", value: "pay/checkout" },
      { label: "No Action", value: "no_actiion" },
      { label: "Shoplift", value: "shoplift" },
      { label: "Phone Engagement", value: "phone_engagement" },
      { label: "Mishandling Documents", value: "mishandling_documents" },
      { label: "Cash Threft", value: "cash_theft" },
      { label: "Activity After Hours", value: "activity_after_hours" },
      { label: "Idle", value: "Idle" },
      { label: "Money Handling", value: "money_handling" },
    ];

    const notificationType = notificationTypes.find(
      (option) => option.value === value
    );

    return notificationType ? notificationType.label : value;
  };

  const warningModalResult = (result) => {
    if (result) {
      deleteNotification(currNoti);
    }
  };

  const openWarningModal = (message) => {
    setWarningMessage(message);
    if (warningMessageModal.current) {
      warningMessageModal.current.openModal();
    }
  };

  const handleRemoveNotificationkClick = (event) => {
    openWarningModal(`Are you sure you want to delete this notification?`);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center">
          <div className="flex justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white ">
            <p>
              <strong>Camera:</strong>&nbsp;{currNoti?.cameraname}
            </p>
            <p>
              <strong>Type:</strong>&nbsp;
              {getNotificationTypesLabel(currNoti?.notification_type)}
            </p>
            <p>
              <strong>Severity:</strong>&nbsp;
              {getSeveritiesLabel(currNoti?.severity)}
            </p>
            <p>
              <strong>Date:</strong>&nbsp;{currNoti?.sent_date}
            </p>
          </div>
          <ReactPlayer url={currVidUrl} width="100%" controls />
          <div className="flex mt-2 space-x-2 justify-center">
            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={(e) => handleRemoveNotificationkClick(e, currNoti)}
            >
              <DeleteForeverIcon
                className="h-6 w-6 text-black-600"
                aria-hidden="true"
              ></DeleteForeverIcon>
            </button>

            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={(e) => handleSaveUserFeedbackClick(e, currNoti, true)}
            >
              <ThumbUpIcon />
            </button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              aria-haspopup="true"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <Typography sx={{ p: 1 }}>Done!</Typography>
            </Popover>
            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={() => openFeedbackModal(currNoti)}
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
      <UserFeedbackModal
        ref={userFeedbackModal}
        SaveFeedbackCallback={handleSaveFeedbackCallback}
      />
      <ErrorMessageModal
        id="a"
        ref={errorMessageModal}
        Title={"Oops! Something Went Wrong!"}
        Message={errorMessage}
      />

      <WarningMessageModal
        ref={warningMessageModal}
        Title={"Caution!"}
        Message={warningMessage}
        WarningResultCallback={warningModalResult}
      />
    </div>
  );
}
