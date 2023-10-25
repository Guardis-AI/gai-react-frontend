import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import VideoList from "../components/VideoList";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
// const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Live() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [currCamNum, setCurrCamNum] = useState(null);
  const [currVidUrl, setCurrVidUrl] = useState(null);

  const { state } = useLocation();
  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    axios
      .get(localStorage.getItem("cfUrl") + "get_camera_list")
      .then(function (response) {
        if (response == null) {
          console.log("No devices found!");
        } else {
          setCameraList(response.data.camera_list);
          if (state) {
            setCurrVidUrl(state.url);
            setCurrCamNum(state.camType);
          } else {
            // this.isloading = true;
            setMainVideo(null, response.data.camera_list[0]);
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [navigate, state]);

  function createUrl(_, camType) {
    return (
      localStorage.getItem("cfUrl") + "media/live/" + camType + "/output.m3u8"
    );
  }

  function setMainVideo(_, camType) {
    const streamUrl = createUrl(_, camType);
    setCurrVidUrl(streamUrl);
    setCurrCamNum(camType);
  }

  return (
    <div className="h-full flex flex-col xl:flex-row space-y-2 p-3 overflow-auto">
      <div className="xl:grow pr-2 flex flex-col">
        <div className="w-5/6 self-center flex flex-col py-3">
          <div className="px-8 py-2 mb-2 bg-[#26272f] rounded-full text-white font-semibold">
            <h6>{currCamNum}</h6>
          </div>

          <ReactPlayer
            id="main"
            url={currVidUrl}
            width="100%"
            // height="100%"
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
      <VideoList
        cameraList={cameraList}
        createUrl={createUrl}
        setMainVideo={setMainVideo}
        setCurrCamNum={setCurrCamNum}
        date={new Date()}
      />
    </div>
  );
}
