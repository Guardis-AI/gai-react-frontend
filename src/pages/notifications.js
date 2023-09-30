import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import NotificationList from "../components/NotificationList";
import axios from "axios";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

const testData = {
  user_id: 1,
  user_name: "Admin",
  user_st_date: "2023-03-08",
  user_end_date: null,
  message_count: 103,
  notification_log: [
    {
      notification_log_id: 224,
      camera_type: "Camera4",
      user_id: 1,
      user_name: "Admin",
      device_id: "null",
      device_token: "null",
      filepath:
        "/home/nvidia/Downloads/theft_detection_min/videos/20230914/Camera4:/shoplift",
      filename: "Camera4:_20230914_12_10_48_theft.mp4",
      noti_status: "false",
      sent_date: "2023-09-14 17:11:12",
      ip_address: "192.168.0.103",
      port: "5554",
      noti_camera_type: "Camera4",
      url: null,
      message_read_flag: null,
    },
    {
      notification_log_id: 26,
      camera_type: "Camera5",
      user_id: 1,
      user_name: "Admin",
      device_id: "null",
      device_token: "7cea2d2ee018d253ff7dbf",
      filepath:
        "/home/nvidia/Downloads/theft_detection_min/videos/20230830/Camera3:/shoplift",
      filename: "Camera3:_20230830_12_53_56_theft.mp4",
      noti_status: "true",
      sent_date: "2023-08-31 05:41:57",
      ip_address: "192.168.0.104",
      port: "554",
      noti_camera_type: "Camera5",
      url: null,
      message_read_flag: null,
    },
    {
      notification_log_id: 25,
      camera_type: "Camera5",
      user_id: 1,
      user_name: "Admin",
      device_id: "null",
      device_token: "7cea2d2ee018d253ff7dbf",
      filepath:
        "/home/nvidia/Downloads/theft_detection_min/videos/20230830/Camera3:/shoplift",
      filename: "Camera3:_20230830_12_53_56_theft.mp4",
      noti_status: "false",
      sent_date: "2023-08-30 18:11:18",
      ip_address: "192.168.0.104",
      port: "554",
      noti_camera_type: "Camera5",
      url: null,
      message_read_flag: null,
    },
  ],
};

export default function Notifications() {
  const [unreadCount, setUnreadCount] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [currNoti, setCurrNoti] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);

  useEffect(() => {
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
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

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
