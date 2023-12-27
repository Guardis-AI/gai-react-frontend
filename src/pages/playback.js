import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createRef,
} from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Slider from "@mui/material/Slider";
import PauseCircleRounded from "@mui/icons-material/PauseCircleRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SlowMotionVideoRoundedIcon from "@mui/icons-material/SlowMotionVideoRounded";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Forward10Icon from '@mui/icons-material/Forward10';
import Replay10Icon from '@mui/icons-material/Replay10';
import IconButton from '@mui/material/IconButton';
import SkipPreviousIcon from '@mui/icons-material/SkipPreviousRounded';
import SkipNextIcon from '@mui/icons-material/SkipNextRounded';

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
  const [timeRange, setTimeRange] = useState([0, 70]);
  const [maxVideoTime, setMaxVideoTime] = useState(60);
  const [minVideoTime, setMinVideoTime] = useState(0);
  const [marks, setMarks] = useState([]);
  const [play, setPlay] = useState(true);
  const [currenTime, setCurrenTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const step = useRef(30);
  const selectedDateRef = useRef(new Date());
  const currentVideoPlayer = createRef();

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

  const handleTimeChange = (event, newValue) => {
    setTimeRange(newValue);

    const startTime = newValue[0];
    currentVideoPlayer.current.seekTo(startTime * 60, "seconds");
    setPlay(true);
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

  const handleProgress = (progress) => {
    const endTime = timeRange[1];

    if (progress.playedSeconds >= endTime * 60) {
      setPlay(false);
    }

    setCurrenTime(progress.playedSeconds);
  };

  const valueLabelFormat = (value) => {
    const minutes = Math.floor(value / 60);
    let seconds = value % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const setVideoSpeed = (speed) => {
    // Get the current time of the video
    const currentTime = currentVideoPlayer.current.getCurrentTime();

    // Set the new time
    let newTime = Math.max(currentTime + speed, 0);

    const endTime = timeRange[1]* 60;

    newTime = newTime <=  endTime? newTime: endTime;

    if (newTime > 0) {
      // Use seekTo to rewind the video
      currentVideoPlayer.current.seekTo(newTime);
    }
  };

  const goToNextCamera = () => {
    var index = cameraList.findIndex(camera => camera.uuid === currCamera.uuid) + 1;

    if(index <= cameraList.length){
      setMainVideo(cameraList[index]);
      setCurrCamera(cameraList[index]);
    }
  }

  const goToBackCamera = () => {
    var index = cameraList.findIndex(camera => camera.uuid === currCamera.uuid) - 1;

    if(index >= 0 ){
      setMainVideo(cameraList[index]);
      setCurrCamera(cameraList[index]);
    }
  }

  const getVideoFileFromTheSource = async(url) =>{
    const request = axios.get(url)
    .then(response => {      
      const fileContent = response.data;
      console.log(fileContent);

      return fileContent;
    })
    .catch(error => {
      console.error('Error fetching the file:', error);
    });

    return await request;
  }

  function parseTextFileContent(textContent) {
    const lines = textContent.split('\n');
    const tsFileList = [];
  
    lines.forEach(line => {
      const [key] = line.split(':');
      //Skip values that start with EXT 
      if (key && !key.toUpperCase().includes('EXT')) {       
        tsFileList.push(key.trim());
      }
    });
  
    return tsFileList;
  }

  const getVideoStarTime = async() =>{
    
   const fileData = await getVideoFileFromTheSource(currVidUrl);
   const tsFileList = parseTextFileContent(fileData);

   tsFileList[0].slice(startIndex, endIndex);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3">
      <div className="xl:grow pr-2 flex flex-col sticky top-0 bg-white">
        <div className="w-5/6 self-center flex flex-col py-3">
          <div className="flex flex-wrap justify-between px-8 py-4 mb-2 bg-[#26272f] rounded-full text-white font-semibold items-center">
            <h2 className="text-3xl">{currCamera.name}</h2>
            <div>
              <span>Selected date: </span>
              <DatePicker
                className="text-black px-2 rounded"
                selected={selectedDateRef.current}
                onChange={(date) => handleDateChange(date)}
              />
            </div>
          </div>
          <ReactPlayer
            ref={currentVideoPlayer}
            onStart={() => {
              var videoDuration = currentVideoPlayer.current.getDuration();
              getVideoStarTime();
              const totalMinutes = Math.round(videoDuration / 60);

              if (totalMinutes <= 60) {
                step.current = 5;
              } else {
                if (totalMinutes <= 300) {
                  step.current = 15;
                } else {
                  if (totalMinutes <= 600) {
                    step.current = 30;
                  } else {
                    step.current = 60;
                  }
                }
              }
              generateTimeLabel(totalMinutes);
              setMaxVideoTime(totalMinutes);
              setTimeRange([0, totalMinutes]);
              setPlaybackRate(1);
              currentVideoPlayer.current.seekTo(1, "seconds");
            }}
            onProgress={handleProgress}
            id="main"
            url={currVidUrl}
            width="100%"
            controls
            playing={play}
            volume={0}
            playbackRate={playbackRate}
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
        <div className="w-5/6 self-center flex  bg-gray-800 text-sm ">
          <div className="flex-1 p-4">
            <div className="text-white text-left">
              <h6>
                <strong>Start Play:</strong>{" "}
                {moment(new Date(selectedDateRef.current)).format(
                  "ddd, MMM DD, YYYY"
                )}{" "}
                &nbsp; {valueLabelFormat(timeRange[0])}
              </h6>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="text-white text-right">
              <h6>
                <strong>End Play:</strong>{" "}
                {moment(new Date(selectedDateRef.current)).format(
                  "ddd, MMM DD, YYYY"
                )}{" "}
                &nbsp; {valueLabelFormat(timeRange[1])}
              </h6>
            </div>
          </div>
        </div>
        <div className="w-5/6 self-center flex bg-slate-200 pl-5 pr-5 rounded-b-lg ">
          <Slider
            sx={{
              "& .css-yafthl-MuiSlider-markLabel": {
                fontSize: "9px",
              },
              "& .css-1eoe787-MuiSlider-markLabel": {
                fontSize: "9px",
              },
            }}
            getAriaLabel={() => "Video Time Selection"}
            defaultValue={0}
            step={step.current}
            min={minVideoTime}
            max={maxVideoTime}
            marks={marks}
            value={timeRange}
            onChange={handleTimeChange}
            valueLabelDisplay="auto"
            color="success"
            valueLabelFormat={(value) => valueLabelFormat(value)}
          />
        </div>
        <div className="w-5/6 self-center flex  bg-gray-800 ">
          <div className="flex-1 p-4 text-white text-left text-sm">
            <h6>
              <strong>Total Time:</strong>{" "}
              {moment(
                new Date(0, 0, 0, 0, 0, (timeRange[1] - timeRange[0]) * 60)
              ).format("HH:mm:ss", { trim: false })}
            </h6>
          </div>
          <div className="inline-flex text-white">
          <IconButton color="inherit" onClick={() => goToBackCamera()}>
              <SkipPreviousIcon fontSize="large"></SkipPreviousIcon>
            </IconButton>
            &nbsp;
            <IconButton color="inherit" onClick={() => setVideoSpeed(-10)}>
              <Replay10Icon fontSize="large"></Replay10Icon>
            </IconButton>
            &nbsp;
            {playbackRate == 1 ? (
              <IconButton color="inherit"
                onClick={() => {
                  setPlay(true);
                  setPlaybackRate(0.4);
                }}              >
                <SlowMotionVideoRoundedIcon fontSize="large"></SlowMotionVideoRoundedIcon>
              </IconButton>
            ) : (
              <IconButton color="inherit"
                onClick={() => {
                  setPlay(true);
                  setPlaybackRate(1);
                }}
              >
                <PlayCircleOutlineIcon fontSize="large"></PlayCircleOutlineIcon>
              </IconButton>
            )}
            &nbsp;
            {!play ? (
              <IconButton color="inherit" onClick={() => { 
                setPlay(true);
                setPlaybackRate(1);
                }}>
                <PlayCircleRoundedIcon fontSize="large"></PlayCircleRoundedIcon>
              </IconButton>
            ) : (
              <IconButton color="inherit"
                onClick={() => {
                  setPlay(false);
                  setPlaybackRate(1);
                }}
              >
                <PauseCircleRounded fontSize="large"></PauseCircleRounded>
              </IconButton>
            )}
            &nbsp;
            <IconButton color="inherit" onClick={() => setVideoSpeed(10)}>
              <Forward10Icon fontSize="large"></Forward10Icon>
            </IconButton>
            &nbsp;
            <IconButton color="inherit" onClick={() => goToNextCamera()}>
              <SkipNextIcon fontSize="large"></SkipNextIcon>
            </IconButton>
          </div>
          <div className="flex-1 p-4 text-white text-right text-sm">
            <h6>
              {moment(new Date(0, 0, 0, 0, 0, currenTime)).format("HH:mm:ss", {
                trim: false,
              })}
              /{" "}
              {moment(new Date(0, 0, 0, 0, 0, timeRange[1] * 60)).format(
                "HH:mm:ss",
                { trim: false }
              )}
            </h6>
          </div>
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
