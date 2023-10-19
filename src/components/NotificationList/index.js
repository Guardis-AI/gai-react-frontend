import React, { useState } from "react";
import ReactPlayer from "react-player";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function NotificationList(props) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  function createUrl(id) {
    const selNoti = props.notifications.find(
      (i) => i.notification_log_id === id
    );
    return localStorage.getItem("cfUrl") + "get_video?path=" + selNoti.filepath;
  }

  function dateFilter(noti) {
    if (!startDate || !endDate) {
      return noti;
    }

    const sentDate = new Date(noti.sent_date);
    if (startDate <= sentDate && sentDate <= endDate) {
      return noti;
    }
  }

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-1/5 md:w-1/2 self-center">
      <div className="flex flex-col justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-xl text-white font-semibold">
        <h6>Notification count: {props.unreadCount}</h6>
        <div>
          <h6>Start date:</h6>
          <div className="bg-white">
            <DatePicker
              value={startDate}
              onChange={(newStart) => setStartDate(newStart)}
            />
          </div>
        </div>
        <div>
          <h6>End date:</h6>
          <div className="bg-white">
            <DatePicker
              value={endDate}
              onChange={(newEnd) => setEndDate(newEnd)}
            />
          </div>
        </div>
      </div>
      {props.notifications
        ?.filter((noti) => dateFilter(noti))
        .map((noti, i) => {
          return (
            <div
              className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f]"
              key={i}
              onClick={() => props.setMainVideo(noti.notification_log_id, null)}
            >
              <h1 className="pb-2">{noti.noti_camera_type}</h1>
              <h1 className="pb-2">{noti.sent_date}</h1>
              <ReactPlayer
                url={createUrl(noti.notification_log_id)}
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
