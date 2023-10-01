import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Live() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cameraList, setCameraList] = useState(null);
  const [currCamNum, setCurrCamNum] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);

  const { state } = useLocation();
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
          if (state) {
            setCurrVidUrl(state.url);
            setCurrCamNum(state.camType);
          } else {
            const firstCam = response[0].camera_type;
            console.log(firstCam);
            // this.isloading = true;
            setMainVideo(selectedDate, firstCam);
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate, selectedDate, state]);

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
    setCurrCamNum(camType);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3">
      <div className="xl:grow pr-2 flex flex-col">
        <h6>{currCamNum}</h6>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />
        <div className="w-5/6 self-center">
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
