import React from "react";
import ReactPlayer from "react-player";
import SaveIcon from "@mui/icons-material/SaveTwoTone";
import CancelIcon from "@mui/icons-material/CancelTwoTone";

export default function VideoList(props) {
  function updatePlayer(camera) {
    props.setMainVideo(camera);
    props.setCurrCamera(camera);
  }

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-1/5 md:w-1/2 self-center">
      {props.cameraList?.map((camera, index) => {
        return (
          <div
            className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f]"
            key={index}
          >
            {camera.editMode ? (
              <div>
                <input
                  type="text"
                  className="border-solid border-1 border-gray rounded mb-2 pl-1 text-black"
                  defaultValue={camera.name}
                  onChange={(e) => props.handleChange(index, e.target.value)}
                ></input>
                <button
                  className="ml-1 mb-2 border-solid border-1 border-gray rounded text-white"
                  onClick={() => props.renameCamera(index)}
                >
                  <SaveIcon />
                </button>
                <button
                  className="ml-1 mb-2 border-solid border-1 border-gray rounded text-white"
                  onClick={() => props.handleEditMode(index, false)}
                >
                  <CancelIcon />
                </button>
              </div>
            ) : (
              <h1
                className="pb-2 text-white"
                onClick={() => props.handleEditMode(index, true)}
              >
                {camera.name}
              </h1>
            )}
            <div onClick={() => updatePlayer(camera)}>
              <ReactPlayer
                key={index}
                url={props.createUrl(camera.mac)}
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
                    `Camera:${camera.name}, there is a error with the video: ${JSON.stringify(
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
  );
}
