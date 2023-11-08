import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Playback() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cameraList, setCameraList] = useState(null);
  const [currCamNum, setCurrCamNum] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    axios
      .get(localStorage.getItem("cfUrl") + "camera/list")
      .then(function (response) {
        if (response == null) {
          console.log("No devices found!");
        } else {
          setCameraList(response.data.camera_list);
          // this.isloading = true;
          setMainVideo(selectedDate, response.data.camera_list[0]);
          setCurrCamNum(response.data.camera_list[0]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate, selectedDate]);

  function createUrl(date, camType) {
    // Format date
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const mm = m < 10 ? "0" + m : m;
    const dd = d < 10 ? "0" + d : d;
    const yyyyMMdd = "" + y + mm + dd;

    return (
      localStorage.getItem("cfUrl") +
      "media/" +
      camType +
      "/" +
      yyyyMMdd +
      "/output.m3u8"
    );
  }

  function setMainVideo(date, camType) {
    const streamUrl = createUrl(date, camType);
    setCurrVidUrl(streamUrl);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center flex flex-col py-3">
          <div className="flex justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white font-semibold">
            <h6>{currCamNum}</h6>
            <div>
              <span>Selected date: </span>
              <DatePicker
                className="text-black"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            </div>
          </div>
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
        createUrl={createUrl}
        setMainVideo={setMainVideo}
        setCurrCamNum={setCurrCamNum}
        date={selectedDate}
      />
    </div>
  );
}
