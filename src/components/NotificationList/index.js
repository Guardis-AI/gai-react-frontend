import React from "react";
import ReactPlayer from "react-player";

export default function NotificationList(props) {
  function createUrl(id) {
    const selNoti = props.notifications.find(
      (i) => i.notification_log_id === id
    );

    return (
      localStorage.getItem("cfUrl") +
      "get_video?path=" +
      selNoti.filepath +
      "&filename=" +
      selNoti.filename
    );
  }

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-1/5 md:w-1/2 self-center">
      <h6 className="text-black">Notifications</h6>
      {props.notifications?.map((noti, i) => {
        return (
          <div
            className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f]"
            key={i}
            onClick={() => props.setMainVideo(noti.notification_log_id)}
          >
            <h1 className="pb-2">{noti.notification_log_id}</h1>
            <ReactPlayer
              url={createUrl(noti.notification_log_id)}
              width="100%"
              height="auto"
            />
          </div>
        );
      })}
    </div>
  );
}
