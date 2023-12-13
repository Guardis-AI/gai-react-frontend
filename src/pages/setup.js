import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ScanModalButton from "../components/ScanModalButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import ErrorMessageModal from "../components/ErrorMessageModal";
import WarningMessageModal from "../components/WarningMessageModal";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import InfoOutlined from "@mui/icons-material/InfoRounded";
import InfoSharpIcon from "@mui/icons-material/InfoSharp";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function Setup() {
  const navigate = useNavigate();
  const [cameraList, setCameraList] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [cameraToRemove, setCameraToRemove] = useState({});
  const [popoverMessage, setPopoverMessage] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  let errorMessageModal = useRef();
  let warningMessageModal = useRef();

  useEffect(() => {
    if (localStorage.getItem("loginStatus") !== "true")
      return navigate("/log-in");

    getCamerasDetails();

    Modal.setAppElement("body");
  }, [navigate]);

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
        openErrorModal(error.response.data);
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
            editMode: false,
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

  const handledRemoveCameraclick = (camera) => {
    setCameraToRemove(camera);

    openWarningModal(`Do you want to Remove the camera: ${camera.name}`);
  };

  const removeCamera = (cameraToRemove) => {
    axios
      .delete(`${localStorage.getItem("cfUrl")}camera/credentials`, {
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
        let message = error.response ? error.response.data : error.message;
        openErrorModal(message);
      });
  };

  const openErrorModal = (message) => {
    if (errorMessageModal.current) {
      setErrorMessage(message);
      errorMessageModal.current.openModal();
    }
  };

  const openWarningModal = (message) => {
    setWarningMessage(message);
    if (warningMessageModal.current) {
      warningMessageModal.current.openModal();
    }
  };

  const warningModalResult = (result) => {
    if (result) {
      removeCamera(cameraToRemove);
    }
  };

  const handleEditMode = (index, value) => {
    const updatedCamera = [...cameraList];
    updatedCamera[index].editMode = value;
    setCameraList(updatedCamera);
  };

  const handleChange = (index, value) => {
    const updatedCamera = [...cameraList];
    updatedCamera[index].name = value;
    setCameraList(updatedCamera);
  };

  const renameCamera = (index) => {
    const cameras = [...cameraList];
    const camera = cameras[index];

    axios
      .put(localStorage.getItem("cfUrl") + "camera/credentials", {
        mac: camera.mac,
        name: camera.name,
        uuid: camera.uuid,
      })
      .then(function (response) {
        if (response == null) {
          console.log("No devices found!");
        } else {
          const camera_list = response.data.map((camera) => {
            return {
              uuid: camera.uuid,
              name: camera.name,
              mac: camera.mac,
              ip: camera.ip,
              port: camera.port,
              vendorName: camera.vendor_name,
              url: camera.uri,
              editMode: false,
            };
          });
          setCameraList(camera_list);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handlePopoverOpen = (event, message) => {
    setPopoverMessage(message);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (timeToBeDisplay = 0) => {
    setTimeout(() => {
      setAnchorEl(null);
    }, timeToBeDisplay);
  };

  return (
    <div>
      <div className="py-3 px-8 h-full overflow-auto">
        <div className="flex flex-row space-x-2 md:space-x-4 flex-wrap space-y-2 max-w-full">
          <div className="flex grow flex-col"></div>
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
            className="py-2 px-8 bg-[#30ac64] rounded-full text-white font-semibold"
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
              <label className="flex flex-col w-11/12">
                IP Address
                <div className="flex space-x-1">
                  <input
                    type="text"
                    name="ip"
                    value={deviceFormData.ip}
                    onChange={handleDeviceFormChange}
                    className="text-black"
                  />
                  <span>
                    <InfoOutlined
                      className="bg-[#26272f] rounded-xl"
                      onMouseEnter={(e) =>
                        handlePopoverOpen(e, "IP address of the camera!")
                      }
                      onMouseLeave={() => handlePopoverClose(5000)}
                    />
                  </span>
                  </div>
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="w-1/6 py-2 px-2 bg-[#30ac64] rounded-full text-white font-semibold ml-auto "
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      </div>
      <div className="flex w-full overflow-auto px-1 px-4 py-4">
        <table className="table-fixed border flex flex-col text-left mt-2 w-full text-xs border-black border-b-0 table-auto rounded">
          <thead className="font-bold  border-b flex border-black  bg-[#26272f]">
            <tr className="flex w-full p-2 text-white ">
              <th className="w-1/2">
                Cf-Url
                <span className="pl-1">
                  <InfoOutlined
                    sx={{ fontSize: 15 }}
                    className="bg-[#26272f] rounded-xl mb-1"
                    onMouseEnter={(e) =>
                      handlePopoverOpen(
                        e,
                        "Copy the code provided when you purchased your subscription. If a code was not provided, please contact customer support for assistance.!"
                      )
                    }
                    onMouseLeave={() => handlePopoverClose(5000)}
                  />
                </span>
              </th>
              <th className="w-1/12 pl-5">
                Port
                <span>
                  <InfoOutlined
                    sx={{ fontSize: 15 }}
                    className="bg-[#26272f] rounded-xl mb-1"
                    onMouseEnter={(e) =>
                      handlePopoverOpen(e, "Port of the camera")
                    }
                    onMouseLeave={() => handlePopoverClose(5000)}
                  />
                </span>
              </th>
              <th className="w-3/12">
                Camera Name{" "}
                <span>
                  <InfoOutlined
                    sx={{ fontSize: 15 }}
                    className="bg-[#26272f] rounded-xl mb-1"
                    onMouseEnter={(e) =>
                      handlePopoverOpen(e, "Name of the camera!")
                    }
                    onMouseLeave={() => handlePopoverClose(5000)}
                  />
                </span>
              </th>
              <th className="w-2/12">
                Mac Address{" "}
                <span>
                  <InfoOutlined
                    sx={{ fontSize: 15 }}
                    className="bg-[#26272f] rounded-xl mb-1"
                    onMouseEnter={(e) =>
                      handlePopoverOpen(e, "Mac Address of the camera!")
                    }
                    onMouseLeave={() => handlePopoverClose(5000)}
                  />
                </span>
              </th>
              <th className="w-2/12">
                IP Address
                <span>
                  <InfoOutlined
                    sx={{ fontSize: 15 }}
                    className="bg-[#26272f] rounded-xl mb-1"
                    onMouseEnter={(e) =>
                      handlePopoverOpen(e, "IP address of the camera!")
                    }
                    onMouseLeave={() => handlePopoverClose(5000)}
                  />
                </span>
              </th>
              <th className="w-2/12">
                Vendor
                <span>
                  <InfoOutlined
                    sx={{ fontSize: 15 }}
                    className="bg-[#26272f] rounded-xl mb-1"
                    onMouseEnter={(e) =>
                      handlePopoverOpen(e, "the brand of the camera!")
                    }
                    onMouseLeave={() => handlePopoverClose(5000)}
                  />
                </span>
              </th>
              <th className="w-1/12">Remove</th>
            </tr>
          </thead>
          <tbody>
            {cameraList?.map((camera, i) => {
              return (
                <React.Fragment key={i}>
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-gray-200" : "bg-white"
                    } border-b p-2 flex border-black`}
                  >
                    <td className="w-1/2 overflow-auto">{camera.url}</td>
                    <td className="w-1/12 overflow-auto pl-5">{camera.port}</td>
                    <td className="w-3/12 overflow-auto">
                      {camera.editMode ? (
                        <div>
                          <input
                            type="text"
                            className="border-solid border-1 border-gray rounded mb-2 pl-1"
                            defaultValue={camera.name}
                            onChange={(e) => handleChange(i, e.target.value)}
                          ></input>
                          <button
                            className="ml-1 mb-2 border-solid border-1 border-gray rounded "
                            onClick={() => renameCamera(i)}
                          >
                            <SaveIcon />
                          </button>
                          <button
                            className="ml-1 mb-2 border-solid border-1 border-gray rounded "
                            onClick={() => handleEditMode(i, false)}
                          >
                            <CancelIcon />
                          </button>
                        </div>
                      ) : (
                        <span onClick={() => handleEditMode(i, true)}>
                          {camera.name}
                        </span>
                      )}
                    </td>
                    <td className="w-2/12 overflow-auto">{camera.mac}</td>
                    <td className="w-2/12 overflow-auto">{camera.ip}</td>
                    <td className="w-2/12">{camera.vendorName}</td>
                    <td className="w-1/12">
                      <button
                        type="button"
                        className="ml-4  bg-transparent hover:bg-[#4f5263] font-semibold hover:text-white py-2 px-2 border border-[#4f5263] hover:border-transparent rounded"
                        onClick={() => handledRemoveCameraclick(camera)}
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
      <WarningMessageModal
        ref={warningMessageModal}
        Title={"Caution!"}
        Message={warningMessage}
        WarningResultCallback={warningModalResult}
      />

      <ErrorMessageModal
        ref={errorMessageModal}
        Title={"Oops! Something Went Wrong!"}
        Message={errorMessage}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handlePopoverClose(0)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: 0.5, fontSize: 11 }}>
          <InfoSharpIcon
            sx={{ fontSize: 15, color: "#30ac64" }}
          ></InfoSharpIcon>{" "}
          {popoverMessage}
        </Typography>
      </Popover>
    </div>
  );
}
