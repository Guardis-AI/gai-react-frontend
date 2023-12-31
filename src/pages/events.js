import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import UserFeedbackModal from "../components/UserFeedbackModal";
import ErrorMessageModal from "../components/ErrorMessageModal";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WarningMessageModal from "../components/WarningMessageModal";
import moment from "moment";

export default function Events() {
  const navigate = useNavigate();
  const [currNoti, setCurrNoti] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  let userFeedbackModal = useRef();
  let errorMessageModal = useRef();
  let warningMessageModal = useRef();
  let cameraList = useRef(null);
  let eventListControl = useRef();

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    if (cameraList.current === null || cameraList.current.length === 0) {
      getCamerasDetails();
    }
  }, [navigate]);

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

    eventListControl.current.setCamerasList(cameraList.current);
  };

  const setMainNotification = (notification) => {
    const streamUrl = `${localStorage.getItem(
      "cfUrl"
    )}notifications/get_video/${notification.clip_id}`;

    setCurrVidUrl(streamUrl);
    setCurrNoti(notification);
  };

  const saveUserFeedback = async (notification, wasgood) => {
    const clip_id = notification.clip_id;
    var response = axios
      .put(`${localStorage.getItem("cfUrl")}notifications/${clip_id}`, {
        clip_id: notification.clip_id,
        camera_id: notification.camera_id,
        user_feedback: wasgood,
        notification_type_id: notification.notification_type.id,
        feedback_notification_type_id:
          notification.feedback_notification_type.id,
      })
      .then(function (response) {
        const endDate = Date.now();
        const startDate = new Date(endDate - 86400 * 1000);
        const model = {
          timestamp: [
            moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
            moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
          ],
        };
        eventListControl.current.getNotifications(model);
      })
      .catch(function (error) {
        openErrorModal(error.message);
        console.log(error);
      });

    await response;
  };

  const deleteNotification = (notification) => {
    const clip_id = notification.clip_id;
    axios
      .delete(`${localStorage.getItem("cfUrl")}notifications/${clip_id}`, null)
      .then(function (response) {
        eventListControl.current.removeNotificationById(clip_id);
        const notification = eventListControl.current.getNextNotification();
        setMainNotification(notification);
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

  const handleSaveFeedbackCallback = async (result, notificationType) => {
    if (result) {
      currNoti.feedback_notification_type = notificationType;

      await saveUserFeedback(currNoti, false);
    }
  };

  const openErrorModal = (message) => {
    if (errorMessageModal.current) {
      setErrorMessage(message);
      errorMessageModal.current.openModal();
    }
  };

  const handleSaveUserFeedbackClick = async (event, notification, wasgood) => {
    if (event) {
      setAnchorEl(event.currentTarget);
      notification.feedback_notification_type = currNoti.notification_type;

      await saveUserFeedback(notification, wasgood);

      setTimeout(() => {
        setAnchorEl(null);
      }, 900);
    }
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
    <div className="h-full flex flex-col lg:flex-row space-y-2 p-3">
      <div className="xl:grow pr-2 flex flex-col sticky top-0 bg-white z-10 py-1 md:py-0">
        <div className="w-5/6 self-center">
          <div className="flex justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-xl md:rounded-full text-white flex-wrap">
            <p>
              <strong>Camera:</strong>&nbsp;{currNoti?.cameraname}
            </p>
            <p>
              <strong>Type:</strong>&nbsp;
              {currNoti?.feedback_notification_type?.human_readable}
            </p>
            <p>
              <strong>Severity:</strong>&nbsp;
              {getSeveritiesLabel(
                currNoti?.feedback_notification_type?.severity
              )}
            </p>
            <p>
              <strong>Date:</strong>&nbsp;{currNoti?.sent_date}
            </p>
          </div>
          <ReactPlayer url={currVidUrl} width="100%" height="auto" controls />
          <div className="flex mt-2 space-x-2 space-y-2 justify-center">
            <button
              type="button"
              className="px-8 py-2 mt-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={(e) => handleRemoveNotificationkClick(e, currNoti)}
            >
              <DeleteForeverIcon />
            </button>
            <button
              type="button"
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
              type="button"
              className="px-8 py-2 bg-[#26272f] rounded-full text-white font-semibold"
              onClick={() => openFeedbackModal(currNoti)}
            >
              <ThumbDownIcon />
            </button>
          </div>
        </div>
      </div>
      <EventList
        ref={eventListControl}
        handleNotificationClick={setMainNotification}
        setMainNotification={setMainNotification}
      />
      <UserFeedbackModal
        ref={userFeedbackModal}
        SaveFeedbackCallback={handleSaveFeedbackCallback}
      />
      <ErrorMessageModal
        id="errorMessageModal"
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
