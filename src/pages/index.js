import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import SaveIcon from "@mui/icons-material/SaveTwoTone";
import CancelIcon from "@mui/icons-material/CancelTwoTone";
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
            return {
              uuid: camera.uuid,
              name: camera.name,
              mac: camera.mac,
              editMode: false,
            };
          });

          setCameraList(camera_list);
          getNotifications(camera_list);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate]);

  function getNotifications(listOfCameras) {
    axios
      .get(`${localStorage.getItem("cfUrl")}notifications`, null)
      .then(async function (response) {
        console.log(response);

        if (response == null) {
          console.log("No events found!");
        } else {
          const notification_list = updateCameraNameInNotifications(
            response.data,
            listOfCameras
          );
          setEvents(notification_list);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function updateCameraNameInNotifications(notificationList, listOfCameras) {
    let notification_list = notificationList.map((notification) => {
      let cameraname = "Generic";

      if (listOfCameras !== null) {
        const camera = listOfCameras.find(
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

    notification_list = notification_list.sort(
      (a, b) => a.sent_date - b.sent_date
    );

    return notification_list;
  }

  function createUrl(macOfCamera) {
    return (
      localStorage.getItem("cfUrl") +
      "media/live/" +
      macOfCamera +
      "/output.m3u8"
    );
  }

  function navNoti(id) {
    const selNoti = events.find((i) => i.clip_id === id);

    const url = `${localStorage.getItem("cfUrl")}notifications/get_video/${
      selNoti.clip_id
    }`;

    navigate("/events", {
      state: {
        id: id,
        url: url,
        cameraname: selNoti.cameraname,
      },
    });
  }

  function renameCamera(index) {
    const cameras = [...cameraList];
    const camera = cameras[index];

    axios
      .put(localStorage.getItem("cfUrl") + "camera/credentials", {
        mac: camera.mac,
        name: camera.name,
        uuid: camera.uuid,
      })
      .then(function (response) {
        if (response == null) {
          console.log("No devices found!");
        } else {
          const camera_list = response.data.map((camera) => {
            return {
              uuid: camera.uuid,
              name: camera.name,
              mac: camera.mac,
              editMode: false,
            };
          });
          setCameraList(camera_list);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const handleChange = (index, value) => {
    const updatedCamera = [...cameraList];
    updatedCamera[index].name = value;
    setCameraList(updatedCamera);
  };

  const handleEditMode = (index, value) => {
    const updatedCamera = [...cameraList];
    updatedCamera[index].editMode = value;
    setCameraList(updatedCamera);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow w-full md:w-5/6 px-6 pr-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {cameraList?.map((camera, index) => {
            return (
              <div
                className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f] pt-2"
                key={index}
              >
                {camera.editMode ? (
                  <div>
                    <input
                      type="text"
                      className="border-solid border-1 border-gray rounded mb-2 pl-1"
                      defaultValue={camera.name}
                      onChange={(e) => handleChange(index, e.target.value)}
                    ></input>
                    <button
                      className="ml-1 mb-2 border-solid border-1 border-gray rounded text-white"
                      onClick={() => renameCamera(index)}
                    >
                      <SaveIcon />
                    </button>
                    <button
                      className="ml-1 mb-2 border-solid border-1 border-gray rounded text-white"
                      onClick={() => handleEditMode(index, false)}
                    >
                      <CancelIcon />
                    </button>
                  </div>
                ) : (
                  <h1
                    className="pb-2 text-white"
                    onClick={() => handleEditMode(index, true)}
                  >
                    {camera.name}
                  </h1>
                )}
                <div
                  onClick={() =>
                    navigate("/live", {
                      state: {
                        url: createUrl(camera.mac),
                        camType: camera.name,
                      },
                    })
                  }
                >
                  <ReactPlayer
                    url={createUrl(camera.mac)}
                    width="100%"
                    height="auto"
                    playing={true}
                    volume={0}
                    config={{
                      file: {
                        hlsOptions: {
                          maxBufferLength: 10, // or 15 or 20 based on tests
                          maxMaxBufferLength: 30,
                        },
                      },
                    }}
                  />
                </div>             
              </div>
            );
          })}
        </div>
      </div>
      <EventList events={events} setMainVideo={navNoti} />
    </div>
  );
}
