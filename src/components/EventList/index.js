import React, { useState } from "react";
import ReactPlayer from "react-player";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function EventList(props) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  function createUrl(id) {
    const selNoti = props.events.find((i) => i.notification_log_id === id);
    return localStorage.getItem("cfUrl") + "get_video?path=" + selNoti.filepath;
  }

  function dateFilter(event) {
    if (!startDate || !endDate) {
      return event;
    }

    const sentDate = new Date(event.sent_date);
    if (startDate <= sentDate && sentDate <= endDate) {
      return event;
    }
  }

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-1/5 md:w-1/2 self-center">
      <div className="flex flex-col justify-between px-8 py-2 mb-2 bg-[#26272f] rounded-xl text-white font-semibold">
        <h6>Event count: {props.unreadCount}</h6>
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
      {props.events
        ?.filter((event) => dateFilter(event))
        .map((event, i) => {
          return (
            <div
              className="p-4 border-solid border-2 border-black rounded-xl bg-[#26272f]"
              key={i}
              onClick={() =>
                props.setMainVideo(event.notification_log_id, null)
              }
            >
              <h1 className="pb-2">{event.noti_camera_type}</h1>
              <h1 className="pb-2">{event.sent_date}</h1>
              <ReactPlayer
                url={createUrl(event.notification_log_id)}
                width="100%"
                height="auto"
                playing={true}
                volume={0}
                config={{
                  file: {
                    hlsOptions: {
                      maxBufferLength: 10, // or 15 or 20 based on tests
                      maxMaxBufferLength: 30,
                    },
                    attributes: { preload: "none" },
                  },
                }}
              />
            </div>
          );
        })}
    </div>
  );
}
