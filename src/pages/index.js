import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import EventList from "../components/EventList";
import { useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/SaveTwoTone";
import CancelIcon from "@mui/icons-material/CancelTwoTone";
import PersonalVideoIcon from "@mui/icons-material/PersonalVideo";
import { getCameras } from "../store/camera/cameraAction";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const navigate = useNavigate();
  // const [cameraList, setCameraList] = useState(null);
  const cameraList = useSelector((state) => state.camera.cameraList);
  const hasCameras = useRef(false);
  let eventListControl = useRef();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");


    //Avoid to load the cameras detail multiple times.
    if (!hasCameras.current) {
      hasCameras.current = true;
      // getCameras();
      dispatch(getCameras());
    }
  }, [navigate]);

  // const getCameras = async () => {
  //   const request = axios
  //     .get(localStorage.getItem("cfUrl") + "camera/credentials")
  //     .then(function (response) {
  //       if (response == null) {
  //         console.log("No devices found!");
  //       } else {
  //         const camera_list = response.data.map((camera) => {
  //           return {
  //             uuid: camera.uuid,
  //             name: camera.name,
  //             mac: camera.mac,
  //             editMode: false,
  //           };
  //         });
  //         return camera_list;
  //       }
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });

  //   const camera_list = await request;
  //   setCameraList(camera_list);

  //   eventListControl.current.setCamerasList(camera_list)
  // };

  function createUrl(macOfCamera) {
    const url = `${localStorage.getItem(
      "cfUrl"
    )}media/live/${macOfCamera}/output.m3u8`;

    return url;
  }

  function navNoti(notification, filterModel) {
    navigate("/events", {
      state: {
        filterModel: filterModel,
        notification: notification,
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
         // setCameraList(camera_list);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const handleChange = (index, value) => {
    const updatedCamera = [...cameraList];
    updatedCamera[index].name = value;
    //setCameraList(updatedCamera);
  };

  const handleEditMode = (index, value) => {
    const updatedCamera = [...cameraList];
    updatedCamera[index].editMode = value;
    //setCameraList(updatedCamera);
  };

  const openModalVideo = (videoUrl, camera) => {
    const winHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Camere: ${camera.name}</title>
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      <style>
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }    
        video {
          width: 100%;
          max-width: 800px;
        }
      </style>
    </head>
    <body>    
    <video id="videoPlayer${camera.uuid}" controls autoplay muted ></video>    
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        const video = document.getElementById('videoPlayer${camera.uuid}');
        const videoUrl = '${videoUrl}'; // Replace with the actual URL to your .m3u8 file
    
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        }
      });
    </script>    
    </body>
    </html>`;

    const winUrl = URL.createObjectURL(
      new Blob([winHtml], { type: "text/html" })
    );

    window.open(
      winUrl,
      "win",
      "toolbar=no, location=no, directories=no, status=no, menubar=no,fullscreen=yes, resizable=yes, scrollbars=no, titlebar=yes"
    );
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
                  <div className="flex">
                    <div className="w-full">
                      <h1
                        className="text-white"
                        onClick={() => handleEditMode(index, true)}
                      >
                        {camera.name}
                      </h1>
                    </div>
                    <div >
                      <button
                        className="text-white float-right"
                        onClick={() =>
                          openModalVideo(createUrl(camera.mac), camera)
                        }
                      >
                        <PersonalVideoIcon></PersonalVideoIcon>
                      </button>
                    </div>
                  </div>
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
                          maxBufferSize: 90,
                          maxBufferHole: 2.5,
                          highBufferWatchdogPeriod: 10,
                          maxFragLookUpTolerance: 2.5,
                          enableWorker: true,
                          lowLatencyMode: true,
                          backBufferLength: 90,
                        },
                      },
                    }}
                    onError={(...args) => {
                      console.log(
                        `Camera:${
                          camera.name
                        }, there is a error with the video: ${JSON.stringify(
                          args[1]
                        )}`
                      );
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <EventList  ref={eventListControl} handleNotificationClick={navNoti} cameraList={cameraList} />
    </div>
  );
}
