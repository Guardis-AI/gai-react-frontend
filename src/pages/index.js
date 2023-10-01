import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import NotificationList from "../components/NotificationList";
import { useNavigate } from "react-router-dom";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Home() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");
    axios
      .post(`${baseUrlApi}/api/user/getdevicelist`, {
        p_user_id: localStorage.getItem("userId"),
        p_device_token: "",
        p_device_type: "",
        p_port: "",
        login_user_id: localStorage.getItem("userId"),
      })
      .then(function (response) {
        console.log(response);
        response = response.data.gai_get_device_list;
        if (response == null) {
          console.log("No devices found!");
        } else {
          setCameraList(response);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

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
        response = response.data.gai_get_user_notification_log;
        if (response == null) {
          console.log("No notifications found!");
        } else {
          setNotifications(response[0].notification_log);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate]);

  function createUrl(camType) {
    // Format date
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const mm = m < 10 ? "0" + m : m;
    const dd = d < 10 ? "0" + d : d;
    const yyyyMMdd = "" + y + mm + dd;

    return (
      localStorage.getItem("cfUrl") +
      "media/" +
      camType +
      "/" +
      yyyyMMdd +
      "/output.m3u8"
    );
  }

  function navNoti(id) {
    const selNoti = notifications.find((i) => i.notification_log_id === id);

    const url =
      localStorage.getItem("cfUrl") +
      "get_video?path=" +
      selNoti.filepath +
      "&filename=" +
      selNoti.filename;

    navigate("/notifications", {
      state: {
        id: id,
        url: url,
      },
    });
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow w-5/6 px-6 pr-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {cameraList?.map((camera, i) => {
            return (
              <div
                className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f] pt-2"
                key={i}
                onClick={() =>
                  navigate("/live", {
                    state: {
                      url: createUrl(camera.camera_type),
                      camType: camera.camera_type,
                    },
                  })
                }
              >
                <h1 className="pb-2 text-white">{camera.camera_type}</h1>
                <ReactPlayer
                  url={createUrl(camera.camera_type)}
                  width="100%"
                  height="auto"
                />
              </div>
            );
          })}
        </div>
      </div>
      <NotificationList notifications={notifications} setMainVideo={navNoti} />
    </div>
  );
}
