import React, { useState, useEffect, useRef } from "react";
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
import UpdateIcon from "@mui/icons-material/Update";
import { useSelector } from "react-redux";
import {
  getNotificationTypesLabel,
  getSeveritiesLabel,
} from "../store/notification/notificationAction";

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
  const [currentEventsLoded, setCurrentEventsLoded] = useState(100);
  
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

    getNotifications();
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

  const setMainVideo = (clip_id, notifications) => {
    let selNoti;

    if (notifications) {
      selNoti = notifications.find((i) => i.clip_id === clip_id);
    } else {
      selNoti = events.find((i) => i.clip_id === clip_id);
    }

    const streamUrl = `${localStorage.getItem(
      "cfUrl"
    )}notifications/get_video/${selNoti.clip_id}`;

    setCurrVidUrl(streamUrl);
    setCurrNoti(selNoti);
  };

  const getNotificationsFromServer = async () => {
    const request = axios
      .get(`${localStorage.getItem("cfUrl")}notifications`, null)
      .then(function (response) {
        if (response == null || response.data.length === 0) {
          console.log("No events found!");
          return null;
        } else {
          let notification_list = response.data.filter(
            (n) => n.user_feedback === null
          );

          notification_list =
            updateCameraNameInNotifications(notification_list);

          return notification_list;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    const notificationList = await request;

    return notificationList;
  };

  const getNotifications = async () => {
    const notificationList = await getNotificationsFromServer();

    setUnreadCount(notificationList.length);
    setEventsFromSever(notificationList);
    setEvents(notificationList.slice(0, currentEventsLoded));

    if (state) {
      if (!currVidUrl) {
        const selNoti = notificationList.find((i) => i.clip_id === state.id);

        selNoti.cameraname = state.cameraname;
        setCurrVidUrl(state.url);
        setCurrNoti(selNoti);
      }
    } else {
      if (!currVidUrl) {
        setMainVideo(notificationList[0].clip_id, notificationList);
      }
    }
  };

  const loadMoreEvents = async () => {
    if (currentEventsLoded >= eventsFromSever.length) {
      const notificationsList = await getNotificationsFromServer();
      let notificationsListDifference = eventsFromSever.filter((event) => {
        return !notificationsList.find((not) => not.clip_id === event.clip_id);
      });

      if (notificationsListDifference.length) {
        setEventsFromSever((events) => [
          ...events,
          ...notificationsListDifference,
        ]);
        setUnreadCount(currentEventsLoded + notificationsListDifference.length);

        if (notificationsListDifference.length > 100) {
          notificationsListDifference = notificationsListDifference.slice(100);
        }

        setEvents((prevEvents) => [
          ...prevEvents,
          ...notificationsListDifference,
        ]);
      }
    } else {
      const nextEnd = currentEventsLoded + 100;
      const nextEvents = eventsFromSever.slice(currentEventsLoded, nextEnd);

      setCurrentEventsLoded(nextEnd);
      setEvents((prevEvents) => [...prevEvents, ...nextEvents]);
    }
  };

  const updateCameraNameInNotifications = (notifications) => {
    let notification_list = notifications.map((notification) => {
      let cameraname = "Generic";

      if (cameraList.current !== null) {
        const camera = cameraList.current.find(
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
        notification_type: notification.notification_type,
      };
    });

    if (currNoti && currNoti.cameraname === "Generic") {
      const notification = notification_list.find(
        (n) => n.clip_id === currNoti.clip_id
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
          (n) => n.clip_id !== response.data.clip_id
        );
        setEvents(notification_list);

        const events_from_sever = eventsFromSever.filter(
          (n) => n.clip_id !== response.data.clip_id
        );
        setEventsFromSever(events_from_sever);

        setUnreadCount(events_from_sever.length);
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
              {useSelector((state) =>
                getNotificationTypesLabel(state, currNoti?.notification_type)
              )}
            </p>
            <p>
              <strong>Severity:</strong>&nbsp;
              {useSelector((state) =>
                getSeveritiesLabel(state, currNoti?.severity)
              )}
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
            <button
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={() => loadMoreEvents()}
            >
              <UpdateIcon />
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
