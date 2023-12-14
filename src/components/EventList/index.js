import React, { useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import numeral from "numeral";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const notificationTypes = [
  { label: "Item Picking", value: "item_picking" },
  { label: "Bagging", value: "bagging" },
  { label: "Pocketing", value: "pocketing" },
  { label: "Enter Store", value: "enter_store" },
  { label: "Leave Store", value: "leave_store" },
  { label: "Pay Or Checkout", value: "pay/checkout" },
  { label: "No Action", value: "no_actiion" },
  { label: "Shoplift", value: "shoplift" },
  { label: "Phone Engagement", value: "phone_engagement" },
  { label: "Mishandling Documents", value: "mishandling_documents" },
  { label: "Cash theft", value: "cash_theft" },
  { label: "Activity After Hours", value: "activity_after_hours" },
  { label: "Idle", value: "Idle" },
  { label: "Money Handling", value: "money_handling" },
  { label: "Check/Document Handling", value: "Check_Document_Handling" },
];

const severities = [
  { label: "Information", value: "INFORMATION", color: "#2E8B57" },
  { label: "Information", value: "INFO", color: "#2E8B57" },
  { label: "Warning", value: "WARNING", color: "#FF7518" },
  { label: "Critical", value: "CRITICAL", color: "#FF0000" },
];

export default function EventList(props) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  function dateFilter(event) {
    if (!startDate && !endDate) {
      return event;
    }

    const sentDate = new Date(event.sent_date);
    const startCheck = startDate <= sentDate || !startDate;
    const endCheck = sentDate <= endDate || !endDate;
    if (startCheck && endCheck) {
      return event;
    }
  }

  const getSeveritiesLabel = (value) => {
    const severity = severities.find((option) => option.value === value);

    return severity ? severity.label : value;
  };

  const getNotificationTypesLabel = (value) => {
    const notificationType = notificationTypes.find(
      (option) => option.value === value
    );

    return notificationType ? notificationType.label : value;
  };

  const getSeveritiesLabelColor = (value) => {
    const severity = severities.find((option) => option.value === value);

    return severity ? severity.color : '#FFFFFF';
  };

  return (
    <div className="h-full overflow-auto text-white space-y-4 xl:w-3/12 md:w-1/2 self-center">
      <div className="flex flex-col justify-between px-4 py-2 mb-2 bg-[#26272f] rounded-xl text-white font-semibold">
        <p>
          {" "}
          Events Loaded:{" "}
          {numeral(
            props.events?.filter((event) => dateFilter(event)).length
          ).format("0,0")}{" "}
          &nbsp; From: {numeral(props.unreadCount).format("0,0")}
        </p>
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
              onClick={() => props.setMainVideo(event.clip_id, null)}
            >
              <PlayCircleOutlineIcon
                className="self-center ml-2 mr-4"
                fontSize="large"
              />
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Camera:</strong> {event.cameraname} <br />
                  <strong>Date:</strong> {event.sent_date}
                  <br />
                  <strong>Type:</strong>{" "}
                  <span> {getNotificationTypesLabel(event.notification_type)}</span>
                  <br />
                  <strong>Severity:</strong>{" "}
                  <span style={{ color: getSeveritiesLabelColor(event.severity) }}>{getSeveritiesLabel(event.severity)}</span>
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
