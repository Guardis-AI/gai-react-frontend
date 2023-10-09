import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Playback() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cameraList, setCameraList] = useState(null);
  const [currCamNum, setCurrCamNum] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");
    // axios
    //   .post(`${baseUrlApi}/api/user/getdevicelist`, {
    //     p_user_id: localStorage.getItem("userId"),
    //     p_device_token: "",
    //     p_device_type: "",
    //     p_port: "",
    //     login_user_id: localStorage.getItem("userId"),
    //   })
    //   .then(function (response) {
    //     response = response.data.gai_get_device_list;
    //     if (response == null) {
    //       console.log("No devices found!");
    //     } else {
    //       setCameraList(response);
    //       const firstCam = response[0].camera_type;
    //       // this.isloading = true;
    //       setMainVideo(selectedDate, firstCam);
    //       setCurrCamNum(firstCam);
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
    setCameraList([
      { camera_type: "Camera1" },
      { camera_type: "Camera2" },
      { camera_type: "Camera3" },
      { camera_type: "Camera4" },
      { camera_type: "Camera5" },
      { camera_type: "Camera6" },
      { camera_type: "Camera7" },
      { camera_type: "Camera8" },
    ]);
    setCurrCamNum("Camera1");
    setMainVideo(selectedDate, "Camera1");
  }, [navigate, selectedDate]);

  function setMainVideo(date, camType) {
    // Format date
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const mm = m < 10 ? "0" + m : m;
    const dd = d < 10 ? "0" + d : d;
    const yyyyMMdd = "" + y + mm + dd;

    const streamUrl =
      localStorage.getItem("cfUrl") +
      "media/" +
      camType +
      "/" +
      yyyyMMdd +
      "/output.m3u8";
    setCurrVidUrl(streamUrl);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center flex flex-col py-3">
          <h6>{currCamNum}</h6>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
          <ReactPlayer
            id="main"
            url={currVidUrl}
            width="100%"
            // height="100%"
            controls
          />
        </div>
      </div>
      <VideoList
        cameraList={cameraList}
        setMainVideo={setMainVideo}
        setCurrCamNum={setCurrCamNum}
        date={selectedDate}
      />
    </div>
  );
}
