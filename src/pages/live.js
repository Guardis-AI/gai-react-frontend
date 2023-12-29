import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function Live() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [currCamera, setCurrCamera] = useState({ namr: "" });
  const [currVidUrl, setCurrVidUrl] = useState(null);
  const { state } = useLocation();
  const hasCameras = useRef(false);

  const setMainVideo = useCallback(
    (camera) => {
      const streamUrl = createUrl(camera.mac);
      setCurrVidUrl(streamUrl);
      setCurrCamera(camera);
    },
    [setCurrVidUrl, setCurrCamera]
  );

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    if (!hasCameras.current) {
      hasCameras.current = true;
      getCameras();
    }
  }, [navigate, setMainVideo]);

  const getCameras = async () => {
    const request = axios
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
              originalname: camera.name,
            };
          });

          return camera_list;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    const camera_list = await request;

    setCameraList(camera_list);

    if (state) {
      setCurrVidUrl(state.url);
      setCurrCamera(state);
    } else {
      setMainVideo(camera_list[0]);
    }
  };

  function createUrl(macOfCamera) {
    const url = `${localStorage.getItem(
      "cfUrl"
    )}media/live/${macOfCamera}/output.m3u8`
    return url;
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
              originalname: camera.name,
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

    if (!value) {
      updatedCamera[index].name = updatedCamera[index].originalname;
    }

    setCameraList(updatedCamera);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3">
      <div className="xl:grow pr-2 flex flex-col sticky top-0 bg-white">
        <div className="w-5/6 self-center flex flex-col py-3">
          <div className="px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white font-semibold">
            <h6>{currCamera.name}</h6>
          </div>

          <ReactPlayer
            id="main"
            url={currVidUrl}
            width="100%"
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
                `Camera:${currCamera.name}, there is a error with the video: ${JSON.stringify(args[1])}`
              );
            }}
          />
        </div>
      </div>
      <VideoList
        cameraList={cameraList}
        createUrl={createUrl}
        setMainVideo={setMainVideo}
        setCurrCamera={setCurrCamera}
        handleChange={handleChange}
        handleEditMode={handleEditMode}
        renameCamera={renameCamera}
      />
    </div>
  );
}
