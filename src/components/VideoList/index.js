import React from "react";
import ReactPlayer from "react-player";

export default function VideoList(props) {
  function updatePlayer(date, camType) {
    props.setMainVideo(date, camType);
    props.setCurrCamNum(camType);
  }

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-1/5 md:w-1/2 self-center">
      {props.cameraList?.map((camera, i) => {
        return (
          <div
            className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f]"
            key={i}
            onClick={() => updatePlayer(props.date, camera)}
          >
            <h1 className="pb-2">{camera}</h1>
            <ReactPlayer
              url={props.createUrl(props.date, camera)}
              width="100%"
              height="auto"
              playing={true}
              volume={0}
            />
          </div>
        );
      })}
    </div>
  );
}