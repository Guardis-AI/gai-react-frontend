import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
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
  const [eventsFromSever, setEventsFromSever] = useState(null);

  let userFeedbackModal = useRef();
  let errorMessageModal = useRef();
  let warningMessageModal = useRef();
  let cameraList = useRef(null);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    if (cameraList.current === null || cameraList.current.length === 0) {
      getCamerasDetails();
    }
  }, [navigate, state]);

  const getCamerasDetails = async () => {
    const request = axios
      .get(localStorage.getItem("cfUrl") + "camera/credentials")
      .then(function (response) {
        if (response == null) {
          console.log("No cameras found!");
        } else {
          const camera_list = response.data.map((camera) => {
            return { uuid: camera.uuid, name: camera.name, mac: camera.mac };
          });

          return camera_list;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    cameraList.current = await request;
  };

  const setMainNotification = (notification) => {
    const streamUrl = `${localStorage.getItem(
      "cfUrl"
    )}notifications/get_video/${notification.clip_id}`;

    setCurrVidUrl(streamUrl);
    setCurrNoti(notification);
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
          user_feedback_notification_type:
            notification.user_feedback_notification_type,
        }
      )
      .then(function (response) {
        const notification_list = events.filter(
          (n) => n.clip_id !== response.data.clip_id
        );
        setEvents(notification_list);

        const events_from_sever = eventsFromSever.filter(
          (n) => n.clip_id !== response.data.clip_id
        );
        setEventsFromSever(events_from_sever);

        setUnreadCount(events_from_sever.length);
        setMainNotification(notification_list[0]);
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
          (n) => n.clip_id !== response.data.clip_id
        );
        setEvents(notification_list);

        const events_from_sever = eventsFromSever.filter(
          (n) => n.clip_id !== response.data.clip_id
        );
        setEventsFromSever(events_from_sever);

        setUnreadCount(events_from_sever.length);
        setMainNotification(notification_list[0]);
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
      currNoti.user_feedback_notification_type = notificationType;
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
    notification.user_feedback_notification_type = currNoti.notification_type;
    saveUserFeedback(notification, wasgood);
  };

  const getSeveritiesLabel = (value) => {
    const severities = [
      { label: "Information", value: "INFORMATION", color: "#30ac64" },
      { label: "Warning", value: "WARNING", color: "#FF7518" },
      { label: "Critical", value: "CRITICAL", color: "#FF0000" },
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
      { label: "Check/Document Handling", value: "Check_Document_Handling" },
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
        handleNotificationClick={setMainNotification}
        setMainNotification={setMainNotification}
        cameraList={cameraList.current}
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
