import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ScanModalButton from "../components/ScanModalButton";
import { TrashIcon } from "@heroicons/react/24/outline";

const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Setup() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [cameraList, setCameraList] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    getCamerasDetails();

    var userId = localStorage.getItem("userId");
    axios
      .post(`${baseUrlApi}/api/user/getuserdetails`, {
        user_id: userId,
        login_user_id: "",
        p_device_type: "",
        p_device_token: "",
        p_logindevice_id: "",
      })
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

  // User Modal
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
    console.log("submitting add User form: ");
    console.log(userFormData);
    axios
      .post(`${baseUrlApi}/api/user/insuser`, userFormData)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  // Device Modal
  const [deviceModalIsOpen, setDeviceModalIsOpen] = useState(false);
  function openDeviceModal() {
    setDeviceModalIsOpen(true);
  }
  function closeDeviceModal() {
    setDeviceModalIsOpen(false);
  }
  const [deviceFormData, setDeviceFormData] = useState({
    name: "",
    ip: "",
    port: "",
    mac: "",
    username: "",
    password: "",
    vendor_name: "",
  });
  function handleDeviceFormChange(e) {
    setDeviceFormData({
      ...deviceFormData,
      [e.target.name]: e.target.value,
    });
  }
  function onDeviceSubmit(e) {
    e.preventDefault();
    let devobj = deviceFormData;
    axios
      .post(`${localStorage.getItem("cfUrl")}camera/credentials`, {
        name: devobj.name,
        ip: devobj.ip,
        port: devobj.port,
        mac: devobj.mac,
        username: devobj.username,
        password: devobj.password,
        vendor_name: devobj.vendor_name,
      })
      .then(function (response) {
        console.log(response);
        restartServices();
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

  const restartServices = () => {
    axios
      .post(localStorage.getItem("cfUrl") + "services/restart", null)
      .then(function (response) {
        console.log("services/restart:", response.data);
        getCamerasDetails();
        closeDeviceModal();
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const getCamerasDetails = () => {
    axios
      .get(localStorage.getItem("cfUrl") + "camera/credentials")
      .then(function (response) {
        const camera_list = response.data.map((camera) => {
          return {
            uuid: camera.uuid,
            name: camera.name,
            mac: camera.mac,
            ip: camera.ip,
            port: camera.port,
            vendorName: camera.vendor_name,
            url: camera.uri,
          };
        });

        if (response === null) {
          console.log("No camera found!");
        } else {
          setCameraList(camera_list);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const removeCamera = (cameraToRemove) => {
    
    axios
      .delete(localStorage.getItem("cfUrl") + "camera/credentials", {
        data: {
          uuid: cameraToRemove.uuid,
          mac: cameraToRemove.mac,
        },
      })
      .then(function (response) {
        if (response == null) {
          console.log("No camera found!");
        } else {
          const newCameraList = cameraList.filter((camera) => {
            return camera.uuid !== cameraToRemove.uuid;
          });

          setCameraList(newCameraList);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div>
      <div className="py-3 px-8 h-full overflow-auto">
        <div className="flex flex-row space-x-2 md:space-x-4 flex-wrap space-y-2 max-w-full">
          <div className="flex grow flex-col">           
          </div>      
          <button
            type="button"
            style={{ display: "none" }}
            className="py-2 px-8 bg-[#26272f] rounded-full text-white font-semibold"
            onClick={openUserModal}
          >
            Add User
          </button>
          <button
            type="button"
            className="py-2 px-8 bg-[#26272f] rounded-full text-white font-semibold"
            onClick={openDeviceModal}
          >
            Add Device
          </button>
          <ScanModalButton />
        </div>

        {/* User Modal */}
        <Modal
          isOpen={userModalIsOpen}
          // onAfterOpen={afterOpenModal}
          onRequestClose={closeUserModal}
          contentLabel="Add User Modal"
          className="bg-[#4f5263] w-full  md:w-2/5 md:h-11/12 overflow-auto text-white rounded-xl"
          style={customStyles}
        >
          <div className="flex bg-[#26272f] justify-between py-2 px-4">
            <h2 className="font-semibold text-xl">Add User</h2>
            <button onClick={closeUserModal} className="font-semibold text-xl">
              X
            </button>
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
                className="text-black"
              />
            </label>
            <label className="flex flex-col w-3/5">
              User Role
              <input
                type="text"
                name="urole"
                value={userFormData.urole}
                onChange={handleUserFormChange}
                className="text-black"
              />
            </label>
            <label className="flex flex-col w-3/5">
              Password
              <input
                type="password"
                name="password"
                value={userFormData.password}
                onChange={handleUserFormChange}
                className="text-black"
              />
            </label>
            <label className="flex flex-col w-3/5">
              Password (Confirm)
              <input
                type="password"
                name="passwordConfirm"
                value={userFormData.passwordConfirm}
                onChange={handleUserFormChange}
                className="text-black"
              />
            </label>
            <label className="flex flex-col w-3/5">
              CF-Url
              <input
                type="text"
                name="cfurl"
                value={userFormData.cfurl}
                onChange={handleUserFormChange}
                className="text-black"
              />
            </label>
            <label className="flex flex-col w-3/5">
              Unit Name
              <input
                type="text"
                name="p_edgeunit"
                value={userFormData.p_edgeunit}
                onChange={handleUserFormChange}
                className="text-black"
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
                  className="text-black"
                />
              </label>
              <label className="flex flex-col w-3/5">
                End Date
                <input
                  type="date"
                  name="end_date"
                  value={userFormData.end_date}
                  onChange={handleUserFormChange}
                  className="text-black"
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
          className="bg-[#4f5263] w-full md:w-2/5 md:h-11/12 overflow-auto text-white rounded-xl"
          style={customStyles}
        >
          <div className="flex bg-[#26272f] justify-between py-2 px-4">
            <h2 className="font-semibold text-xl">Add Device</h2>
            <button
              onClick={closeDeviceModal}
              className="font-semibold text-xl"
            >
              X
            </button>
          </div>
          <form
            className="flex flex-col space-y-3 px-5 py-2 pb-4"
            onSubmit={(e) => onDeviceSubmit(e)}
          >
            <div className="flex space-x-2">
              <label className="flex flex-col w-3/5">
                User Name
                <input
                  type="text"
                  name="username"
                  value={deviceFormData.username}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
              <label className="flex flex-col w-3/5">
                Password
                <input
                  type="password"
                  name="password"
                  value={deviceFormData.password}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
            </div>
            <div className="flex space-x-2">
              <label className="flex flex-col w-3/5">
                Port
                <input
                  type="text"
                  name="port"
                  value={deviceFormData.port}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
              <label className="flex flex-col w-3/5">
                Mac Address
                <input
                  type="text"
                  name="mac"
                  value={deviceFormData.mac}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
            </div>
            <div className="flex space-x-2">
              <label className="flex flex-col w-3/5">
                Camera Name
                <input
                  type="text"
                  name="name"
                  value={deviceFormData.name}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
              <label className="flex flex-col w-3/5">
                Vendor Name
                <input
                  type="text"
                  name="vendor_name"
                  value={deviceFormData.vendor_name}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
            </div>
            <div className="flex space-x-2">
              <label className="flex flex-col w-3/5">
                IP Address
                <input
                  type="text"
                  name="ip"
                  value={deviceFormData.ip}
                  onChange={handleDeviceFormChange}
                  className="text-black"
                />
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="w-1/6 bg-[#26272f] rounded-full text-white font-semibold ml-auto "
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      </div>
      <div className="flex w-full overflow-auto px-1">
        <table className="table-fixed border flex flex-col text-left mt-2 w-full text-xs border-black border-b-0">
          <thead className="font-bold  border-b flex border-black ">
            <tr className="flex w-full p-2">
              <th className="w-1/2">URL</th>
              <th className="w-1/12 pl-2">Port</th>
              <th className="w-1/12">Camera Name</th>
              <th className="w-1/12">Mac Address</th>
              <th className="w-1/12">IP Address</th>
              <th className="w-2/12">Vendor</th>
              <th className="w-1/12"></th>
            </tr>
          </thead>
          <tbody>
            {cameraList?.map((camera, i) => {
              return (
                <React.Fragment key={i}>
                  <tr className="border-b p-2 flex border-black" key={i}>
                    <td className="w-1/2 overflow-auto">{camera.url}</td>
                    <td className="w-1/12 overflow-auto pl-2">{camera.port}</td>
                    <td className="w-1/12 overflow-auto">{camera.name}</td>
                    <td className="w-1/12 overflow-auto">{camera.mac}</td>
                    <td className="w-1/12 overflow-auto">{camera.ip}</td>
                    <td className="w-2/12">{camera.vendorName}</td>
                    <td className="w-1/12">
                      <button
                        type="button"
                        className="bg-transparent hover:bg-[#4f5263] font-semibold hover:text-white py-2 px-2 border border-[#4f5263] hover:border-transparent rounded"
                        onClick={() => removeCamera(camera)}
                      >
                        <TrashIcon
                          className="h-4 w-4 text-black-600"
                          aria-hidden="true"
                        ></TrashIcon>
                      </button>
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
