import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import numeral from "numeral";
import Select from "react-select";
import axios from "axios";
import moment from "moment";
import AddIcon from "@mui/icons-material/Queue";
import { useLocation } from "react-router-dom";
import ErrorMessageModal from "../../components/ErrorMessageModal";
import AlertMessageModal from "../../components/AlertMessageModal";
import notificationTypeApi from "../../api/notification";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const severities = [
  { label: "Information", value: "INFORMATION", color: "#30ac64" },
  { label: "Warning", value: "WARNING", color: "#FF7518" },
  { label: "Critical", value: "CRITICAL", color: "#FF0000" },
];

const EventList = forwardRef((props, ref) => {
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notificationType, setNotificationType] = useState();
  const [severity, setSeverity] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [camera, setCamera] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsFromServer, setNotificationsFromServer] = useState([]);
  const [currentEventsLoded, setCurrentEventsLoded] = useState(0);
  const [totalOfNotification, setTotalOfNotification] = useState(0);
  const [eventsToLoadedForPage] = useState(1000);
  const { state } = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loadingNotification, setLoadingNotification] = useState(true);

  let errorMessageModal = useRef();
  let alertMessageModal = useRef();
  let cameraList = useRef(null);

  useImperativeHandle(ref, () => ({
    getNextNotification,
    removeNotificationById,
    setCamerasList,
    getNotifications,
  }));

  useEffect(() => {
    let model = {};
    let startDate = null;
    let endDate = null;

    getNotificationTypes();

    if (state) {
      model = state.filterModel;

      if (model.timestamp) {
        startDate = new Date(model.timestamp[0]);
        endDate = new Date(model.timestamp[1]);
      }

      if (model.camera_id && cameraList.current != null) {
        const camara = cameraList.current.find(
          (option) => option.mac === model.camera_id
        );
        setCamera(camara);
      }

      if (model.severity) {
        setSeverity(model.severity);
      }

      if (model.feedback_notification_type) {
        const notificationType = notificationTypes.find(
          (option) => option.id === model.id
        );
        setNotificationType(notificationType);
      }
    } else {
      endDate = Date.now();
      startDate = new Date(endDate - 86400 * 1000);
      model = {
        timestamp: [
          moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
          moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
        ],
      };
    }

    setStartDate(startDate);
    setEndDate(endDate);

    getNotifications(model, false);
  }, [state]);

  const setCamerasList = (cameras) => {
    cameraList.current = cameras;
  };

  const getSeveritiesLabel = (value) => {
    const severity = severities.find((option) => option.value === value);

    return severity ? severity.label : value;
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
    groupHeading: (provided, state) => ({
      ...provided,
      color: groupHeadingTextColor(state.data),
      fontSize: "12px",
      textTransform: "capitalize!import",
    }),
  };

  const getCurrentFilterModel = () => {
    let model = {};

    if (camera) {
      model.camera_id = camera.mac;
    }

    if (severity || notificationType) {
      model.feedback_notification_type = {};

      if (notificationType) {
        model.feedback_notification_type.id = notificationType.id;
      }

      if (severity) {
        model.feedback_notification_type.severity = severity;
      }
    }

    if (startDate && endDate) {
      model.timestamp = [
        moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
        moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
      ];
    }

    return model;
  };

  const getNextNotification = () => {
    const notification = notifications[0];

    return notification;
  };

  const removeNotificationById = (clip_id) => {
    const notificationList = notifications.filter((n) => n.clip_id !== clip_id);

    const notificationListFromServer = notificationsFromServer.filter(
      (n) => n.clip_id !== clip_id
    );

    setNotifications(notificationList);
    setNotificationsFromServer(notificationListFromServer);
  };

  const searchHandle = async () => {
    if (startDate >= endDate) {
      openErrorModal(
        "The start date cannot be after or equal to the end date!"
      );
    } else {
      const model = getCurrentFilterModel();
      await getNotifications(model);
    }
  };

  const updateCameraNameInNotifications = (notifications) => {
    const camera_List = cameraList.current;

    let notification_list = notifications.map((notification) => {
      let cameraname = "Generic";

      if (camera_List !== null) {
        const camera = camera_List.find(
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
        feedback_notification_type: notification.feedback_notification_type,
      };
    });

    return notification_list;
  };

  const getNotifications = async (model, displayNotFoundMessage = true) => {
    setLoadingNotification(true);
    const notificationList = await getNotificationsFromServer(model);
    if (notificationList) {
      setTotalOfNotification(notificationList.length);
      setNotificationsFromServer(notificationList);

      if (notificationList.length >= eventsToLoadedForPage) {
        setNotifications(notificationList.slice(0, eventsToLoadedForPage));
        setCurrentEventsLoded(eventsToLoadedForPage);
      } else {
        setNotifications(notificationList);
      }

      if (props.setMainNotification) {
        let mainNotification = {};

        if (state) {
          mainNotification = state.notification;
        } else {
          mainNotification = notificationList[0];
        }
        props.setMainNotification(mainNotification);
      }
    } else {
      if (displayNotFoundMessage) {
        openAlertModal(
          "There is not notification that match with current values selected in the filters!"
        );
      }

      setNotifications([]);
    }

    setLoadingNotification(false);
  };

  const getNotificationTypes = async () => {
    let notificationTypeList = await notificationTypeApi.getNotificationTypes();

    if (notificationTypeList) {
      notificationTypeList = groupBy(notificationTypeList, "severity");
    }

    setNotificationTypes(notificationTypeList);
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
    if (currentEventsLoded >= notificationsFromServer.length) {
      const model = getCurrentFilterModel();
      const notificationsList = await getNotificationsFromServer(model);

      if (notificationsList) {
        let notificationsListDifference = notificationsFromServer.filter(
          (event) => {
            return !notificationsList.find(
              (not) => not.clip_id === event.clip_id
            );
          }
        );

        if (notificationsListDifference.length) {
          setNotificationsFromServer((events) => [
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

      if (nextEnd >= notificationsFromServer.length) {
        nextEnd = notificationsFromServer.length;
      }

      const nextEvents = notificationsFromServer.slice(
        currentEventsLoded,
        nextEnd
      );
      setCurrentEventsLoded(nextEnd);
      setNotifications((prevEvents) => [...prevEvents, ...nextEvents]);
    }
  };

  const openErrorModal = (message) => {
    if (errorMessageModal.current) {
      setErrorMessage(message);
      errorMessageModal.current.openModal();
    }
  };

  const openAlertModal = (message) => {
    if (errorMessageModal.current) {
      setAlertMessage(message);
      alertMessageModal.current.openModal();
    }
  };

  const groupBy = (array, property) => {
    return Object.values(
      array.reduce((acc, obj) => {
        const key = obj[property];

        // Check if the key (group) already exists, if not, create it
        if (!acc[key]) {
          acc[key] = { label: key, options: [] };
        }

        // Push the current object to the group's options
        acc[key].options.push(obj);

        return acc;
      }, {})
    );
  };

  const groupHeadingTextColor = (option, state) => {
    // Set text color based on the group property
    if (option.label === "CRITICAL") {
      return "#FF0000";
    }

    if (option.label === "WARNING") {
      return "#FF7518";
    }

    if (option.label === "INFORMATION") {
      return "#30ac64";
    }
    // Default text color for other options
    return "black";
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
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.human_readable}
              styles={customStyles}
              name={"notificationTypes"}
              placeholder={"Select an option"}
              className="text-sm  rounded-lg"
              onChange={handleNotificationTypeSelectChange}
              options={notificationTypes}
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
              options={cameraList.current}
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
      {loadingNotification ? (
        <div>
          <br />
          <br />
          <div class="flex items-center justify-center">
            <div class="w-16 h-16 border-t-4 border-green-400 border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      ) : notifications.length > 0 ? (
        notifications.map((event, i) => {
          return (
            <div
              className="flex border-solid border-2 border-black rounded-xl space-x-2 overflow-hidden bg-[#26272f]"
              key={i}
              onClick={() =>
                props.handleNotificationClick(event, getCurrentFilterModel())
              }
            >
              <div
                className={
                  "flex justify-items-center mr-1 " +
                  (event.user_feedback !== null ? " bg-[#30ac64]" : "")
                }
              >
                <PlayCircleOutlineIcon
                  className="self-center ml-3 mr-3"
                  fontSize="large"
                />
              </div>
              <div className="space-y-3 text-sm py-4 pr-4">
                <p>
                  <strong>Camera:</strong> {event.cameraname} <br />
                  <strong>Date:</strong> {event.sent_date}
                  <br />
                  <strong>Type:</strong>{" "}
                  <span>
                    {event.feedback_notification_type?.human_readable}
                  </span>
                  <br />
                  <strong>Severity:</strong>&nbsp;
                  <span
                    style={{
                      color: getSeveritiesLabelColor(
                        event.feedback_notification_type.severity
                      ),
                    }}
                  >
                    {getSeveritiesLabel(
                      event.feedback_notification_type.severity
                    )}
                  </span>
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div>
          <div className="bg-gray-50 w-full mt-6 text-center ">
            <span
              className="w-full mx-4 my-4  bg-green-100 border-green-400 text-green-700 border-l-4 p-2"
              role="alert"
            >
              There are not notification to show yet!
            </span>
          </div>
        </div>
      )}
      <ErrorMessageModal
        id="errorMessageModal"
        ref={errorMessageModal}
        Title={"Oops! Something Went Wrong!"}
        Message={errorMessage}
      />
      <AlertMessageModal
        id="alertMessageModal"
        ref={alertMessageModal}
        Title={"No Results Found!"}
        Message={alertMessage}
      />
      ;
    </div>
  );
});

export default EventList;
