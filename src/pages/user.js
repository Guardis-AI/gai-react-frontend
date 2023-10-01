import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function User() {
  const navigate = useNavigate();
  // const userColumns = [
  //   "user_id",
  //   "user_name",
  //   "edgeunit",
  //   "user_st_date",
  //   "tot_devices",
  //   "action",
  // ];
  // const deviceColumns = [
  //   "device_id",
  //   "p_url",
  //   "p_port",
  //   "p_Camera_Type",
  //   "dev_st_date",
  //   "p_IP_Address",
  //   "edit",
  // ];

  const [userData, setUserData] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const [userModalIsOpen, setUserModalIsOpen] = useState(false);
  function openUserModal() {
    setUserModalIsOpen(true);
  }
  function closeUserModal() {
    setUserModalIsOpen(false);
  }
  const [userFormData, setUserFormData] = useState({
    user_id: "",
    username: "",
    urole: "",
    password: "",
    passwordConfirm: "",
    cfurl: "",
    p_edgeunit: "",
    start_date: "",
    end_date: "",
  });
  function handleUserFormChange(e) {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  }
  function onUserSubmit() {
    axios
      .post(`${baseUrlApi}/api/user/insuser`, userFormData)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const [deviceModalIsOpen, setDeviceModalIsOpen] = useState(false);
  function openDeviceModal() {
    setDeviceModalIsOpen(true);
  }
  function closeDeviceModal() {
    setDeviceModalIsOpen(false);
  }
  const [deviceFormData, setDeviceFormData] = useState({
    user_id: "",
    p_IP_Address: "",
    p_url: "",
    p_Camera_Type: "",
    p_port: "",
    start_date: "",
    end_date: "",
    p_send_notification: false,
    login_user_id: localStorage.getItem("userId"),
    p_Camdevice_id: [""],
  });
  function handleDeviceFormChange(e) {
    setDeviceFormData({
      ...deviceFormData,
      [e.target.name]: e.target.value,
    });
  }
  function onDeviceSubmit() {
    let devobj = deviceFormData;
    devobj.p_username = localStorage.getItem("userName");
    devobj.p_device_type = "";
    devobj.p_device_token = "";
    devobj.p_logindevice_id = "";
    axios
      .post(`${baseUrlApi}/api/user/insuserdevice`, devobj)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const customStyles = {
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  };

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");
    axios
      .post(`${baseUrlApi}/api/user/getuserdetails`, {})
      .then(function (response) {
        response = response.data.gai_get_user_details;
        if (response === null) {
          console.log("No user found!");
        } else {
          setUserData(response);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    Modal.setAppElement("body");
  }, [navigate]);

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  return (
    <div className="py-3 px-8 h-full overflow-auto">
      <div className="flex flex-row space-x-4">
        <div className="flex grow flex-col">
          <h1 className="font-semibold text-3xl">Users</h1>
          <span className="text-gray-600">
            {userData?.length === 1 ? "1 User" : userData?.length + " Users"}
          </span>
        </div>
        <input
          className="border-solid border-2 border-gray rounded-full px-8"
          type="text"
          placeholder="Search User..."
          onChange={handleChange}
          value={searchInput}
        />
        <button
          className="px-8 bg-[#26272f] rounded-full text-white font-semibold"
          onClick={openUserModal}
        >
          Add
        </button>
        <button
          className="px-8 bg-[#26272f] rounded-full text-white font-semibold"
          onClick={openDeviceModal}
        >
          Add Device
        </button>
      </div>

      {/* User Modal */}
      <Modal
        isOpen={userModalIsOpen}
        // onAfterOpen={afterOpenModal}
        onRequestClose={closeUserModal}
        contentLabel="Add User Modal"
        className="bg-slate-200 w-2/5 h-11/12 overflow-auto"
        style={customStyles}
      >
        <div className="flex bg-slate-300 justify-between p-2">
          <h2>Add User</h2>
          <button onClick={closeUserModal}>X</button>
        </div>
        <form
          className="flex flex-col space-y-3 px-5 py-2 pb-4"
          onSubmit={onUserSubmit}
        >
          <label className="flex flex-col w-3/5">
            Username
            <input
              type="text"
              name="username"
              value={userFormData.username}
              onChange={handleUserFormChange}
            />
          </label>
          <label className="flex flex-col w-3/5">
            User Role
            <input
              type="text"
              name="urole"
              value={userFormData.urole}
              onChange={handleUserFormChange}
            />
          </label>
          <label className="flex flex-col w-3/5">
            Password
            <input
              type="password"
              name="password"
              value={userFormData.password}
              onChange={handleUserFormChange}
            />
          </label>
          <label className="flex flex-col w-3/5">
            Password (Confirm)
            <input
              type="password"
              name="passwordConfirm"
              value={userFormData.passwordConfirm}
              onChange={handleUserFormChange}
            />
          </label>
          <label className="flex flex-col w-3/5">
            CF-Url
            <input
              type="text"
              name="cfurl"
              value={userFormData.cfurl}
              onChange={handleUserFormChange}
            />
          </label>
          <label className="flex flex-col w-3/5">
            Unit Name
            <input
              type="text"
              name="p_edgeunit"
              value={userFormData.p_edgeunit}
              onChange={handleUserFormChange}
            />
          </label>
          <div className="flex space-x-2">
            <label className="flex flex-col w-3/5">
              Start Date
              <input
                type="date"
                name="start_date"
                value={userFormData.start_date}
                onChange={handleUserFormChange}
              />
            </label>
            <label className="flex flex-col w-3/5">
              End Date
              <input
                type="date"
                name="end_date"
                value={userFormData.end_date}
                onChange={handleUserFormChange}
              />
            </label>
          </div>
          <button
            type="submit"
            className="bg-[#26272f] rounded-full text-white font-semibold"
          >
            Save
          </button>
        </form>
      </Modal>

      {/* Device Modal */}
      <Modal
        isOpen={deviceModalIsOpen}
        onRequestClose={closeDeviceModal}
        contentLabel="Add Device Modal"
        className="bg-slate-200 w-2/5 h-11/12 overflow-auto"
        style={customStyles}
      >
        <div className="flex bg-slate-300 justify-between p-2">
          <h2>Add Device</h2>
          <button onClick={closeDeviceModal}>X</button>
        </div>
        <form
          className="flex flex-col space-y-3 px-5 py-2 pb-4"
          onSubmit={onDeviceSubmit}
        >
          <div className="flex space-x-2">
            <label className="flex flex-col w-3/5">
              User
              <input
                type="text"
                name="user_id"
                value={deviceFormData.user_id}
                onChange={handleDeviceFormChange}
              />
            </label>
            <label className="flex flex-col w-3/5">
              IP Address
              <input
                type="text"
                name="p_IP_Address"
                value={deviceFormData.p_IP_Address}
                onChange={handleDeviceFormChange}
              />
            </label>
          </div>
          <label className="flex flex-col w-3/5">
            URL
            <input
              type="text"
              name="p_url"
              value={deviceFormData.p_url}
              onChange={handleDeviceFormChange}
            />
          </label>
          <div className="flex space-x-2">
            <label className="flex flex-col w-3/5">
              Camera Type
              <input
                type="text"
                name="p_Camera_Type"
                value={deviceFormData.p_Camera_Type}
                onChange={handleDeviceFormChange}
              />
            </label>
            <label className="flex flex-col w-3/5">
              Port
              <input
                type="text"
                name="p_port"
                value={deviceFormData.p_port}
                onChange={handleDeviceFormChange}
              />
            </label>
          </div>
          <div className="flex space-x-2">
            <label className="flex flex-col w-3/5">
              Start Date
              <input
                type="date"
                name="start_date"
                value={deviceFormData.start_date}
                onChange={handleDeviceFormChange}
              />
            </label>
            <label className="flex flex-col w-3/5">
              End Date
              <input
                type="date"
                name="end_date"
                value={deviceFormData.end_date}
                onChange={handleDeviceFormChange}
              />
            </label>
          </div>
          <button
            type="submit"
            className="bg-[#26272f] rounded-full text-white font-semibold"
          >
            Save
          </button>
        </form>
      </Modal>

      {/* <div className="drop-shadow"> */}
      <div>
        <table className="table-fixed border flex flex-col text-left mt-2 border-b-0 drop-shadow-none">
          <thead>
            <tr className="font-bold p-2 border-b flex !drop-shadow-none">
              <th className="w-1/6">User Id</th>
              <th className="w-1/6">User Name</th>
              <th className="w-1/6">Edge Unit</th>
              <th className="w-1/6">Start Date</th>
              <th className="w-1/6">Total Devices</th>
              <th className="w-1/6">Action</th>
            </tr>
          </thead>
          <tbody className="!drop-shadow-none">
            {userData?.map((user, i) => {
              return (
                <React.Fragment key={i}>
                  <tr className="border-b p-2 flex">
                    <td className="w-1/6">{user.user_id}</td>
                    <td className="w-1/6">{user.user_name}</td>
                    <td className="w-1/6">{user.edgeunit}</td>
                    <td className="w-1/6">{user.user_st_date}</td>
                    <td className="w-1/6">{user.tot_devices}</td>
                    <td className="w-1/6">
                      <button>Edit</button>
                    </td>
                  </tr>
                  <tr className="border-b p-2 flex">
                    <td className="flex w-full">
                      <table className="table-fixed border flex flex-col text-left mt-2 w-full text-xs border-black border-b-0">
                        <thead className="font-bold  border-b flex border-black ">
                          <tr className="flex w-full p-2">
                            {/* {deviceColumns.map((column) => {
                            return <th className="w-1/12">{column}</th>;
                          })} */}
                            <th className="w-1/12">Device ID</th>
                            <th className="w-1/2">URL</th>
                            <th className="w-1/12 pl-2">Port</th>
                            <th className="w-1/12">Camera Type</th>
                            <th className="w-1/12">Start Date</th>
                            <th className="w-1/12">IP Address</th>
                            <th className="w-1/12">Edit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.user_devices?.map((device, i) => {
                            return (
                              <tr
                                className="border-b p-2 flex border-black"
                                key={i}
                              >
                                <td className="w-1/12">{device.device_id}</td>
                                <td className="w-1/2 overflow-auto">
                                  {device.url}
                                </td>
                                <td className="w-1/12 overflow-auto pl-2">
                                  {device.port}
                                </td>
                                <td className="w-1/12 overflow-auto">
                                  {device.camera_type}
                                </td>
                                <td className="w-1/12 overflow-auto">
                                  {device.dev_st_date}
                                </td>
                                <td className="w-1/12 overflow-auto">
                                  {device.ip_address}
                                </td>
                                <td className="w-1/12">
                                  <button>Edit</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
