import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createRef,
} from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Slider from "@mui/material/Slider";
import SyncAltRoundedIcon from "@mui/icons-material/SyncAltRounded";

export default function Playback() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [currCamera, setCurrCamera] = useState({ namr: "" });
  const [currVidUrl, setCurrVidUrl] = useState(null);
  const [value, setValue] = useState([0, 70]);
  const [maxVideoTime, setMaxVideoTime] = useState(60);
  const [minVideoTime, setMinVideoTime] = useState(0);
  const [marks, setMarks] = useState([]);
  //const [step, setStep] = useState(30);
  //let step = 5;

  const step = useRef(30);
  const selectedDateRef = useRef(new Date());
  const currentVideoPlayer = createRef();

  const setMainVideo = useCallback((camera) => {
    const streamUrl = createUrl(camera.mac);
    setCurrVidUrl(streamUrl);
  }, []);

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
  }, [navigate, setMainVideo]);

  function createUrl(macOfCamera) {
    const yyyyMMdd = moment(selectedDateRef.current).format("yyyyMMDD");

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
    selectedDateRef.current = date;
    setMainVideo(currCamera);
  };

  const handleTimeChange = (event, newValue) => {
    setValue(newValue);
  };

  const generateTimeLabel = (timeSpan) => {
    let marks = [{ value: 0, label: "0:00" }];

    for (let i = step.current; i < timeSpan; ) {
      const minutes = Math.floor(i / 60);
      const seconds = i % 60;
      const label = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      marks.push({ value: i, label: label });
      i = i + step.current;
    }

    setMarks(marks);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center flex flex-col py-3">
          <div className="flex justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white font-semibold">
            <h6>{currCamera.name}</h6>
            <div>
              <span>Selected date: </span>
              <DatePicker
                className="text-black"
                selected={selectedDateRef.current}
                onChange={(date) => handleDateChange(date)}
              />
            </div>
          </div>
          <ReactPlayer
            ref={currentVideoPlayer}
            onStart={() => {
              var videoDuration = currentVideoPlayer.current.getDuration();
              const totalMinutes = Math.round(videoDuration / 60);

              if (totalMinutes <= 60) {
                step.current = 5;
              } else {
                if (totalMinutes <= 300) {
                  step.current = 15;
                }else{
                  step.current = 30;
                }
              }

              generateTimeLabel(totalMinutes);
              setMaxVideoTime(totalMinutes);
              setValue([0, totalMinutes]);
            }}
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
        <div className="w-5/6 self-center flex  bg-gray-800 ">
          <div className="flex-1 p-4">
            <div className="text-white text-left">
              <h6>
                {moment(new Date(selectedDateRef.current)).format("llll")}
              </h6>
            </div>
          </div>
          <div className="p-2">
            <SyncAltRoundedIcon className="text-white" fontSize="large" />
          </div>
          <div className="flex-1 p-4">
            <div className="text-white text-right">
              <h6>
                {moment(new Date(selectedDateRef.current)).format("llll")}
              </h6>
            </div>
          </div>
        </div>
        <div className="w-5/6 self-center flex bg-slate-200 pl-5 pr-5 rounded-b-lg ">
          <Slider
            getAriaLabel={() => "Video Time Selection"}
            defaultValue={0}
            step={step.current}
            min={minVideoTime}
            max={maxVideoTime}
            marks={marks}
            value={value}
            onChange={handleTimeChange}
            valueLabelDisplay="auto"
            color="success"
            valueLabelFormat={(value) => {
              const minutes = Math.floor(value / 60);
              const seconds = value % 60;
              return `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
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
