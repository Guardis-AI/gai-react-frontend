import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import { useNavigate } from "react-router-dom";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Home() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [events, setEvents] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    axios
      .get(localStorage.getItem("cfUrl") + "camera/credentials")
      .then(function (response) {
        if (response == null) {
          console.log("No devices found!");
        } else {
          const camera_list = response.data.map((camera) => {
            return { uuid: camera.uuid, name: camera.name };
          });

          setCameraList(camera_list);
          // this.isloading = true;
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
        response = response.data.gai_get_user_notification_log;
        if (response == null) {
          console.log("No events found!");
        } else {
          setEvents(response[0].notification_log);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate]);

  function createUrl(camType) {
    return (
      localStorage.getItem("cfUrl") + "media/live/" + camType + "/output.m3u8"
    );
  }

  function navNoti(id) {
    const selNoti = events.find((i) => i.notification_log_id === id);

    const url =
      localStorage.getItem("cfUrl") +
      "get_video?path=" +
      selNoti.filepath +
      "&filename=" +
      selNoti.filename;

    navigate("/events", {
      state: {
        id: id,
        url: url,
      },
    });
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow w-5/6 px-6 pr-8">
        <h2 className="font-semibold text-3xl mb-2">Live Feeds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {cameraList?.map((camera, i) => {
            return (
              <div
                className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f] pt-2"
                key={i}
                onClick={() =>
                  navigate("/live", {
                    state: {
                      url: createUrl(camera.uuid),
                      camType: camera.name,
                    },
                  })
                }
              >
                <h1 className="pb-2 text-white">{camera.name}</h1>
                <ReactPlayer
                  url={createUrl(camera.uuid)}
                  width="100%"
                  height="auto"
                  playing={true}
                  volume={0}
                />
              </div>
            );
          })}
        </div>
      </div>
      <EventList events={events} setMainVideo={navNoti} />
    </div>
  );
}
