import React, { useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import numeral from "numeral";
import Select from "react-select";

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
  { label: "Information", value: "INFORMATION", color: "#30ac64" },
  { label: "Warning", value: "WARNING", color: "#FF7518" },
  { label: "Critical", value: "CRITICAL", color: "#FF0000" },
];

export default function EventList(props) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notificationType, setNotificationType] = useState();
  const [severity, setSeverity] = useState();
  const [selectedColor, setSelectedColor] = useState("");

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

    return severity ? severity.color : "#FFFFFF";
  };

  const handleNotificationTypeSelectChange = (selectedOption) => {
    setNotificationType(selectedOption);
  };

  const handleSeveritySelectChange = (e) => {
    e.preventDefault();
    const selectedOption = severities.find(
      (option) => option.value === e.target.value
    );

    setSeverity(selectedOption.value);
    setSelectedColor(selectedOption.color);
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
        <div className="flex mt-2">
          <div className="py-2 rounded mr-2">
            <ThemeProvider theme={darkTheme}>
              <DateTimePicker
                className="text-sm"
                label="Start Date"
                value={startDate}
                onChange={(newStart) => setStartDate(newStart)}
              />
            </ThemeProvider>
          </div>
          <div className="py-2 rounded ml-4">
            <ThemeProvider theme={darkTheme}>
              <DateTimePicker
                label="End Date"
                value={endDate}
                onChange={(newEnd) => setEndDate(newEnd)}
              />
            </ThemeProvider>
          </div>
        </div>
        <div className="flex mt-2">
          <div className="inset-0 items-center justify-center w-full">
            <div className="p-2 w-full">
              <h6 className="m-1" >Types:</h6>
              <Select
                style="overflow: visible"
                name={"notificationTypes"}
                placeholder={"Select an option"}
                className="text-sm  rounded-lg"
                onChange={handleNotificationTypeSelectChange}
                options={notificationTypes.sort((a, b) =>
                  a.label.localeCompare(b.label)
                )}
                value={notificationType}
                isSearchable={true}
              />
            </div>
          </div>
        </div>
        <div className="flex  w-full">
          <div className="p-2 w-full">
          <h6 className="m-1" >Severity:</h6>
            <select
              id="severity"
              className=" w-full border-gray-300 border py-2 pl-3 rounded-lg text-sm text-gray-900"
              value={severity}
              onChange={handleSeveritySelectChange}
              style={{ color: selectedColor }}
            >
              <option value="" disabled>
                Select an option
              </option>
              {severities.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ color: option.color }}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex w-full">
          <div className="p-2 w-full">
          <h6 className="m-1" >Camera:</h6>
            <select
              id="severity"
              className=" w-full border-gray-300 border py-2 pl-3 rounded-lg text-sm text-gray-900"
              value={severity}
              onChange={handleSeveritySelectChange}
              style={{ color: selectedColor }}
            >
              <option value="" disabled>
                Select an option
              </option>
              {severities.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ color: option.color }}
                >
                  {option.label}
                </option>
              ))}
            </select>
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
                  <span>
                    {" "}
                    {getNotificationTypesLabel(event.notification_type)}
                  </span>
                  <br />
                  <strong>Severity:</strong>{" "}
                  <span
                    style={{ color: getSeveritiesLabelColor(event.severity) }}
                  >
                    {getSeveritiesLabel(event.severity)}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
