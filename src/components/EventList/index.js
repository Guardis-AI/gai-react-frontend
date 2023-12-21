import React, { useState, useEffect } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import numeral from "numeral";
import Select from "react-select";
import axios from "axios";
import moment from "moment";
import AddIcon from "@mui/icons-material/Queue";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

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
  { label: "Cash theft", value: "cash_theft" },
  { label: "Activity After Hours", value: "activity_after_hours" },
  { label: "Idle", value: "Idle" },
  { label: "Money Handling", value: "money_handling" },
  { label: "Check/Document Handling", value: "Check_Document_Handling" },
];

const severities = [
  { label: "Information", value: "INFORMATION", color: "#30ac64" },
  { label: "Warning", value: "WARNING", color: "#FF7518" },
  { label: "Critical", value: "CRITICAL", color: "#FF0000" },
];

export default function EventList(props) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notificationType, setNotificationType] = useState();
  const [severity, setSeverity] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [camera, setCamera] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [eventsFromSever, setEventsFromSever] = useState([]);
  const [currentEventsLoded, setCurrentEventsLoded] = useState(0);
  const [totalOfNotification, setTotalOfNotification] = useState(0);
  const [eventsToLoadedForPage] = useState(1000);

  useEffect(() => {
    if (eventsFromSever.length === 0) {
      const startDate = new Date().setHours(0, 0, 0, 0);
      const endDate = new Date().setHours(23, 55, 0, 0);

      const model = {
        timestamp: [
          moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
          moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
        ],
      };

      setStartDate(startDate);
      setEndDate(endDate);

      getNotifications(model);
    }
  }, []);

  const getSeveritiesLabel = (value) => {
    const severity = severities.find((option) => option.value === value);

    return severity ? severity.label : value;
  };

  const getNotificationTypesLabel = (value) => {
    const notificationType = notificationTypes.find(
      (option) => option.value === value
    );

    return notificationType ? notificationType.label : value;
  };

  const getSeveritiesLabelColor = (value) => {
    const severity = severities.find((option) => option.value === value);

    return severity ? severity.color : "#FFFFFF";
  };

  const handleNotificationTypeSelectChange = (selectedOption) => {
    setNotificationType(selectedOption);
  };

  const handleSeveritySelectChange = (e) => {
    e.preventDefault();
    const selectedOption = severities.find(
      (option) => option.value === e.target.value
    );

    setSeverity(selectedOption.value);
    setSelectedColor(selectedOption.color);
  };

  const handleCameraSelectChange = (selectedOption) => {
    setCamera(selectedOption);
  };

  const getOptionTextColor = (option, state) => {
    // Set text color based on the group property
    if (option.group === "group1") {
      return "darkblue";
    } else if (option.group === "group2") {
      return "darkgreen";
    }

    // Default text color for other options
    return "black";
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: getOptionTextColor(state.data),
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "black",
    }),
  };

  const getCurrentModel = () => {
    let model = {};

    if (camera) {
      model.camera_id = camera.mac;
    }

    if (severity) {
      model.severity = severity;
    }

    if (notificationType) {
      model.notification_type = notificationType.value;
    }

    if (startDate && endDate) {
      model.timestamp = [
        moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
        moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
      ];
    }

    return model;
  };

  const searchHandle = async () => {
    const model = getCurrentModel();
    await getNotifications(model);
  };

  const updateCameraNameInNotifications = (notifications) => {
    let notification_list = notifications.map((notification) => {
      let cameraname = "Generic";

      if (props.cameraList !== null) {
        const camera = props.cameraList.find(
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

    return notification_list;
  };

  const getNotifications = async (model) => {
    const notificationList = await getNotificationsFromServer(model);
    if (notificationList) {
      setTotalOfNotification(notificationList.length);
      setEventsFromSever(notificationList);

      if (notificationList.length >= eventsToLoadedForPage) {
        setNotifications(notificationList.slice(0, eventsToLoadedForPage));
        setCurrentEventsLoded(eventsToLoadedForPage);
      } else {
        setNotifications(notificationList);
      }

      // if (state) {
      //   if (!currVidUrl) {
      //     const selNoti = notificationList.find((i) => i.clip_id === state.id);

      //     selNoti.cameraname = state.cameraname;
      //     setCurrVidUrl(state.url);
      //     setCurrNoti(selNoti);
      //   }
      // } else {
      // if (!currVidUrl) {
      if (props.setMainNotification) {
        props.setMainNotification(notificationList[0]);
      }
      // }
      // }
    }
  };

  const getNotificationsFromServer = async (model) => {
    const request = axios
      .post(`${localStorage.getItem("cfUrl")}notifications/filter`, model)
      .then(function (response) {
        if (response == null || response.data.length === 0) {
          console.log("No events found!");
          return null;
        } else {
          const notification_list = updateCameraNameInNotifications(
            response.data
          );

          return notification_list;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    const notificationList = await request;

    return notificationList;
  };

  const loadMoreEvents = async () => {
    if (currentEventsLoded >= eventsFromSever.length) {
      const model = getCurrentModel();
      const notificationsList = await getNotificationsFromServer(model);

      if (notificationsList) {
        let notificationsListDifference = eventsFromSever.filter((event) => {
          return !notificationsList.find(
            (not) => not.clip_id === event.clip_id
          );
        });

        if (notificationsListDifference.length) {
          setEventsFromSever((events) => [
            ...events,
            ...notificationsListDifference,
          ]);

          if (notificationsListDifference.length > eventsToLoadedForPage) {
            notificationsListDifference = notificationsListDifference.slice(
              eventsToLoadedForPage
            );
          }

          setNotifications((prevEvents) => [
            ...prevEvents,
            ...notificationsListDifference,
          ]);
        }
      }
    } else {
      let nextEnd = currentEventsLoded + eventsToLoadedForPage;

      if (nextEnd >= eventsFromSever.length) {
        nextEnd = eventsFromSever.length;
      }

      const nextEvents = eventsFromSever.slice(currentEventsLoded, nextEnd);
      setCurrentEventsLoded(nextEnd);
      setNotifications((prevEvents) => [...prevEvents, ...nextEvents]);
    }
  };

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-3/12 md:w-1/2 self-center">
      <div className="flex flex-col justify-between px-4 py-2 mb-2 bg-[#26272f] rounded-xl text-white font-semibold">
        <div className="flex mt-1">
          <p className="text-sm w-3/5">
            <strong>Events Loaded: </strong>
            {numeral(notifications.length).format("0,0")}
          </p>
          &nbsp;
          {notifications.length >= eventsToLoadedForPage && (
            <p className="mr-4 text-sm w-2/4 float-right">
              <strong>From: </strong>
              {numeral(totalOfNotification).format("0,0")}
            </p>
          )}
        </div>
        <div className="flex mt-3">
          <div className="py-2 rounded mr-2">
            <ThemeProvider theme={darkTheme}>
              <DateTimePicker
                className="text-sm"
                label="Start Date"
                value={startDate}
                onChange={(newStart) => setStartDate(newStart)}
              />
            </ThemeProvider>
          </div>
          <div className="py-2 rounded ml-4">
            <ThemeProvider theme={darkTheme}>
              <DateTimePicker
                label="End Date"
                value={endDate}
                onChange={(newEnd) => setEndDate(newEnd)}
              />
            </ThemeProvider>
          </div>
        </div>
        <div className="flex">
          <div className="p-2 w-full">
            <h6 className="mb-1">Types:</h6>
            <Select
              styles={customStyles}
              name={"notificationTypes"}
              placeholder={"Select an option"}
              className="text-sm  rounded-lg"
              onChange={handleNotificationTypeSelectChange}
              options={notificationTypes.sort((a, b) =>
                a.label.localeCompare(b.label)
              )}
              value={notificationType}
              isSearchable={true}
            />
          </div>
        </div>
        <div className="flex  w-full">
          <div className="p-2 w-full">
            <h6 className="mb-1">Severity:</h6>
            <select
              id="severity"
              className=" w-full border-gray-300 border py-2 pl-3 rounded-lg text-sm text-gray-900"
              value={severity}
              onChange={handleSeveritySelectChange}
              style={{ color: selectedColor }}
            >
              <option value="" disabled>
                Select an option
              </option>
              {severities.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ color: option.color }}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex w-full">
          <div className="p-2 w-full ">
            <h6 className="mb-1">Camera:</h6>
            <Select
              styles={customStyles}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              name={"camera"}
              placeholder={"Select an option"}
              className="text-sm rounded-lg"
              onChange={handleCameraSelectChange}
              options={props.cameraList}
              value={camera}
              isSearchable={true}
            />
          </div>
        </div>
        <div className="flex w-full">
          <div className="p-1 w-full">
            {notifications.length >= eventsToLoadedForPage && (
              <button
                color="success"
                className="btn bg-[#30ac64] text-sm px-3 py-1 mt-1  rounded-full text-white font-semibold hover:bg-emerald-600 "
                onClick={() => loadMoreEvents()}
              >
                <AddIcon /> Next {eventsToLoadedForPage}
              </button>
            )}
            <button
              type="button"
              className="btn float-right px-3 mt-1 py-1 bg-[#30ac64]  hover:bg-emerald-600 rounded-full text-white font-semibold"
              onClick={searchHandle}
            >
              <SearchIcon></SearchIcon>
            </button>
          </div>
        </div>
      </div>
      {notifications.map((event, i) => {
        return (
          <div
            className="flex p-4 border-solid border-2 border-black rounded-xl bg-[#26272f] space-x-2"
            key={i}
            onClick={() => props.handleNotificationClick(event)}
          >
            <PlayCircleOutlineIcon
              className="self-center ml-2 mr-4"
              fontSize="large"
            />
            <div className="space-y-3 text-sm">
              <p>
                <strong>Camera:</strong> {event.cameraname} <br />
                <strong>Date:</strong> {event.sent_date}
                <br />
                <strong>Type:</strong>{" "}
                <span>
                  {getNotificationTypesLabel(event.notification_type)}
                </span>
                <br />
                <strong>Severity:</strong>{" "}
                <span
                  style={{ color: getSeveritiesLabelColor(event.severity) }}
                >
                  {getSeveritiesLabel(event.severity)}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
