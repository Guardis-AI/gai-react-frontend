import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Playback() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [currCamera, setCurrCamera] = useState({ namr: "" });
  const [currVidUrl, setCurrVidUrl] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());

  function setMainVideo(camera) {
    const streamUrl = createUrl(camera.mac);
    console.log(streamUrl);
    setCurrVidUrl(streamUrl);
  }

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
              originalname: camera.name,
            };
          });

          setCameraList(camera_list);
          setMainVideo(camera_list[0]);
          setCurrCamera(camera_list[0]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, selectedDate]);

  function createUrl(macOfCamera) {
    const yyyyMMdd = moment(selectedDate).format("yyyyMMDD");

    const videoUrl = `${localStorage.getItem(
      "cfUrl"
    )}media/${macOfCamera}/${yyyyMMdd}/output.m3u8`;
    return videoUrl;
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

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setMainVideo(currCamera);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3">
      <div className="xl:grow pr-2 flex flex-col sticky top-0 bg-white">
        <div className="w-5/6 self-center flex flex-col py-3">
          <div className="flex flex-wrap justify-between px-8 py-4 mb-2 bg-[#26272f] rounded-full text-white font-semibold items-center">
            <h2 className="text-3xl">{currCamera.name}</h2>
            <div>
              <ThemeProvider theme={darkTheme}>
                <DatePicker
                  label="Selected Date"
                  value={selectedDate}
                  onChange={(newDate) => handleDateChange(newDate)}
                  disableFuture
                />
              </ThemeProvider>
            </div>
          </div>
          <ReactPlayer
            id="main"
            url={currVidUrl}
            width="100%"
            controls
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
                `There is a error with the video: ${JSON.stringify(args[1])}`
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
        removeCamera={removeCamera}
        handleChange={handleChange}
        handleEditMode={handleEditMode}
        renameCamera={renameCamera}
      />
    </div>
  );
}
