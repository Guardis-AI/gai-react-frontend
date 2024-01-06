import React, { useState, useEffect, useRef, PureComponent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import ErrorMessageModal from "../components/ErrorMessageModal";
import AlertMessageModal from "../components/AlertMessageModal";
import notificationTypeApi from "../api/notification";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Analytics() {
  const navigate = useNavigate();
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [severity, setSeverity] = useState("");
  const [camera, setCamera] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsFromServer, setNotificationsFromServer] = useState([]);
  const [currentEventsLoded, setCurrentEventsLoded] = useState(0);
  const [totalOfNotification, setTotalOfNotification] = useState(0);
  const [eventsToLoadedForPage] = useState(1000);
  //   const { state } = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loadingNotification, setLoadingNotification] = useState(true);
  const [radarData, setRadarData] = useState([]);

  let errorMessageModal = useRef();
  let alertMessageModal = useRef();
  let cameraList = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");
  }, [navigate]);

  useEffect(() => {
    let model = {};
    let startDate = null;
    let endDate = null;

    getNotificationTypes();

    endDate = Date.now();
    startDate = new Date(endDate - 86400 * 1000);
    model = {
      timestamp: [
        moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
        moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
      ],
    };

    setStartDate(startDate);
    setEndDate(endDate);

    getNotifications(model, false);
  }, []);

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

  const getNotificationTypes = async () => {
    let notificationTypeList = await notificationTypeApi.getNotificationTypes();

    // if (notificationTypeList) {
    //   notificationTypeList = groupBy(notificationTypeList, "severity");
    // }

    setNotificationTypes(notificationTypeList);
  };

  const getNotifications = async (model, displayNotFoundMessage = true) => {
    setLoadingNotification(true);
    const notificationList = await getNotificationsFromServer(model);
    if (notificationList) {
      setTotalOfNotification(notificationList.length);
      setNotificationsFromServer(notificationList);
      //   genRadarData(notificationList);

      if (notificationList.length >= eventsToLoadedForPage) {
        setNotifications(notificationList.slice(0, eventsToLoadedForPage));
        setCurrentEventsLoded(eventsToLoadedForPage);
      } else {
        setNotifications(notificationList);
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

  function genRadarData(notifications) {
    const tempRadarData = [];
    console.log(notifications);
    // const notificationTypes = [];

    // notifications.forEach((notification) => {
    //   if (!notificationTypes.includes(notification.feedback_notification_type.human_readable)) {
    //     notificationTypes.push(notification.feedback_notification_type.human_readable);
    //   }
    // });

    notificationTypes.forEach((notificationType) => {
      const radarDataItem = {
        name: notificationType.human_readable,
        count: 0,
        notifications: [],
      };

      notifications.forEach((notification) => {
        if (
          notification.feedback_notification_type.human_readable ===
          notificationType.human_readable
        ) {
          console.log("here");
          radarDataItem["count"] += 1;
          radarDataItem["notifications"].push(notification);
        }
      });

      tempRadarData.push(radarDataItem);
    });
    console.log("tempradar:", tempRadarData);

    setRadarData(tempRadarData);
  }

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

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="border-2 h-full flex flex-col overflow-auto">
      <div className="flex">
        <h1>Analytics</h1>
        <button onClick={() => genRadarData(notifications)}>
          Generate Graphs
        </button>
      </div>

      <div className="flex h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              name="Events Count"
              dataKey="count"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={400} height={400}>
            <Pie
              dataKey="count"
              isAnimationActive={false}
              data={radarData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            />
            {/* <Pie
            dataKey="count"
            data={radarData}
            cx={500}
            cy={200}
            innerRadius={40}
            outerRadius={80}
            fill="#82ca9d"
          /> */}
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={radarData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              fill="#8884d8"
              activeBar={<Rectangle fill="pink" stroke="blue" />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
    </div>
  );
}
