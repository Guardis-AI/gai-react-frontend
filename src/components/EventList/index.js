import React, { useState } from "react";
// import ReactPlayer from "react-player";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function EventList(props) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // function createUrl(id) {
  //   const selNoti = props.events.find((i) => i.notification_log_id === id);
  //   return localStorage.getItem("cfUrl") + "get_video?path=" + selNoti.filepath;
  // }

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
    <div className="h-full overflow-auto text-white space-y-4 xl:w-3/12 md:w-1/2 self-center">
      <div className="flex flex-col justify-between px-4 py-2 mb-2 bg-[#26272f] rounded-xl text-white font-semibold">
        <h6>Event count: {props.unreadCount}</h6>
        <div>
          <h6>Start date:</h6>
          <div className="py-2 rounded">
            <ThemeProvider theme={darkTheme}>
              <DateTimePicker
                label="Start Date"
                value={startDate}
                onChange={(newStart) => setStartDate(newStart)}
              />
            </ThemeProvider>
          </div>
        </div>
        <div>
          <h6>End date:</h6>
          <div className="py-2 rounded">
            <ThemeProvider theme={darkTheme}>
              <DateTimePicker
                label="End Date"
                value={endDate}
                onChange={(newEnd) => setEndDate(newEnd)}
              />
            </ThemeProvider>
          </div>
        </div>
      </div>
      {props.events
        ?.filter((event) => dateFilter(event))
        .map((event, i) => {
          return (
            <div
              className="flex p-4 border-solid border-2 border-black rounded-xl bg-[#26272f] space-x-2"
              key={i}
              onClick={() =>
                props.setMainVideo(event.notification_log_id, null)
              }
            >
              <PlayCircleOutlineIcon
                className="self-center ml-2 mr-4"
                fontSize="large"
              />
              <div className="space-y-3">
                <h1>{event.noti_camera_type}</h1>
                <h1>{event.sent_date}</h1>
              </div>

              {/* <ReactPlayer
                url={createUrl(event.notification_log_id)}
                width="100%"
                height="auto"
                playing={false}
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
              /> */}
            </div>
          );
        })}
    </div>
  );
}
