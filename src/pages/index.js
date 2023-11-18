import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import { useNavigate } from "react-router-dom";
import RemoveIcon from "@mui/icons-material/Delete";
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
            return { uuid: camera.uuid, name: camera.name, mac: camera.mac };
          });

          setCameraList(camera_list);
          // this.isloading = true;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    axios
      .get(`${localStorage.getItem("cfUrl")}notifications`, null)
      .then(async function (response) {
        console.log(response);

        if (response == null) {
          console.log("No events found!");
        } else {
          const notification_list = response.data.map((notification) => {
            let cameraname = "Generic";

            if (cameraList !== null) {
              const camera = cameraList.find(
                (c) => c.mac === notification.camera_id
              );
              cameraname = camera ? camera.name : cameraname;
            }

            return {
              clip_id: notification.clip_id,
              camera_id: notification.camera_id,
              cameraname: cameraname,
              sent_date: new Date(notification.timestamp).toLocaleDateString(),
              severity: notification.severity,
              user_feedback: notification.user_feedback,
            };
          });
          setEvents(notification_list);
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
    const selNoti = events.find((i) => i.clip_id === id);

    const url = `${localStorage.getItem("cfUrl")}/notifications/get_video/${
      selNoti.clip_id
    }`;

    navigate("/events", {
      state: {
        id: id,
        url: url,
      },
    });
  }

  function removeCamera(cameraToRemove) {
    axios
      .delete(localStorage.getItem("cfUrl") + "camera/credentials", {
        data: {
          uuid: cameraToRemove.uuid,
          mac: cameraToRemove.mac,
        },
      })
      .then(function (response) {
        if (response == null) {
          console.log("No camera found!");
        } else {
          const newCameraList = cameraList.filter((camera) => {
            return camera.uuid !== cameraToRemove.uuid;
          });

          setCameraList(newCameraList);
        }
      })
      .catch(function (error) {
        console.log(error);
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
              >
                <div
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
                <div className="text-right">
                  <button
                    type="button"
                    className="pt-1 bg-[#26272f] rounded-full text-white font-semibold "
                    onClick={() => removeCamera(camera)}
                  >
                    <RemoveIcon />
                  </button>
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
