import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  Fragment,
} from "react";
import Modal from "react-modal";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import { red } from "@mui/material/colors";

const DEFAULT_USERNAME = "";
const DEFAULT_PASSWORD = "";

export default function ScanModalButton() {
  const [scanData, setScanData] = useState(null);
  const [scanModalIsOpen, setScanModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [step, setStep] = useState("edit");
  const [successCams, setSuccessCams] = useState([]);
  const [failedCams, setFailedCams] = useState([]);
  const [loading, setLoading] = useState(null);

  function openScanModal() {
    setScanModalIsOpen(true);
  }

  const closeScanModal = useCallback(async () => {
    axios
      .post(localStorage.getItem("cfUrl") + "services/restart", null)
      .then(function (response) {
        console.log("services/restart:", response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    setScanModalIsOpen(false);
    setScanData(null);
  }, [setScanModalIsOpen, setScanData]);

  function onScan() {
    console.log("Scanning devices...");
    setModalContent(editModalContent);
    setStep("edit");
    openScanModal();
    axios
      .get(localStorage.getItem("cfUrl") + "camera/scan")
      .then(function (response) {
        console.log(response.data);
        const tempData = response.data;
        const tempLoading = [];
        tempData.forEach((device) => {
          device.username = DEFAULT_USERNAME;
          device.password = DEFAULT_PASSWORD;
          tempLoading.push(false);
        });
        setScanData(tempData);
        setLoading(tempLoading);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  const onDelete = useCallback(
    (i) => {
      setScanData((prevScanData) =>
        prevScanData.filter((cam) => prevScanData[i] !== cam)
      );
      setFailedCams((prevFailedCams) =>
        prevFailedCams.filter((failedCam) => prevFailedCams[i] !== failedCam)
      );
    },
    [setScanData]
  );

  function onUsernameChange(e, i) {
    setScanData((prevScanData) => {
      const newScanData = [...prevScanData];
      newScanData[i].username = e.target.value;
      return newScanData;
    });
  }

  function onPasswordChange(e, i) {
    setScanData((prevScanData) => {
      const newScanData = [...prevScanData];
      newScanData[i].password = e.target.value;
      return newScanData;
    });
  }

  const onValidate = useCallback(
    async (i) => {
      console.log("Validating device:", i);
      const camera = scanData[i];
      try {
        const response = await axios.post(
          localStorage.getItem("cfUrl") + "camera/credentials",
          {
            ip: camera.ip,
            mac: camera.mac,
            vendor_name: camera.vendor_name,
            username: camera.username,
            password: camera.password,
          }
        );
        console.log("POST response:", response);
        setFailedCams((prevFailedCams) =>
          prevFailedCams.filter((failedCam) => failedCam !== camera)
        );
        setSuccessCams((prevSuccessCams) => [...prevSuccessCams, camera]);
      } catch (postError) {
        if (
          postError.response &&
          postError.response.data === "Camera already exists"
        ) {
          try {
            const response = await axios.put(
              localStorage.getItem("cfUrl") + "camera/credentials",
              {
                ip: camera.ip,
                mac: camera.mac,
                vendor_name: camera.vendor_name,
                username: camera.username,
                password: camera.password,
              }
            );
            console.log("PUT response:", camera, response);
            setFailedCams((prevFailedCams) =>
              prevFailedCams.filter((failedCam) => failedCam !== camera)
            );
            setSuccessCams((prevSuccessCams) => [...prevSuccessCams, camera]);
          } catch (putError) {
            console.error("PUT error:", camera, putError);
            setFailedCams((prevFailedCams) => [...prevFailedCams, camera]);
          }
        } else {
          console.error("POST error:", camera, postError);
          setFailedCams((prevFailedCams) => [...prevFailedCams, camera]);
        }
      }
    },
    [scanData, setFailedCams, setSuccessCams]
  );

  const customStyles = {
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const onFinish = useCallback(() => {
    closeScanModal();
    setScanData(null);
    setSuccessCams([]);
    setFailedCams([]);
  }, [closeScanModal, setScanData, setSuccessCams, setFailedCams]);

  const confirmModalContent = useMemo(() => {
    function getConfirmModalContent(successCams, failedCams) {
      return (
        <React.Fragment>
          <h2 className="font-semibold">Success:</h2>
          <div className="flex">
            <span className="w-1/5 font-semibold">IP</span>
            <span className="w-2/5 font-semibold">Mac Address</span>
            <span className="w-2/5 font-semibold">Vendor</span>
          </div>
          {successCams.map((cam, i) => {
            return (
              <div key={i} className="flex">
                <span className="w-1/5">{cam.ip}</span>
                <span className="w-2/5">{cam.mac}</span>
                <span className="w-2/5">{cam.vendor_name}</span>
              </div>
            );
          })}
          <h2 className="font-semibold">Failed:</h2>
          <div className="flex">
            <span className="w-1/5 font-semibold">IP</span>
            <span className="w-2/5 font-semibold">Mac Address</span>
            <span className="w-2/5 font-semibold">Vendor</span>
          </div>
          {failedCams.map((cam, i) => {
            return (
              <div key={i} className="flex">
                <span className="w-1/5">{cam.ip}</span>
                <span className="w-2/5">{cam.mac}</span>
                <span className="w-2/5">{cam.vendor_name}</span>
              </div>
            );
          })}
          <button
            type="button"
            className="bg-[#26272f] rounded-full text-white font-semibold py-2 px-4 self-end"
            onClick={onFinish}
          >
            Finish
          </button>
        </React.Fragment>
      );
    }
    return getConfirmModalContent(successCams, failedCams);
  }, [successCams, failedCams, onFinish]);

  const onContinue = useCallback(() => {
    console.log(successCams);
    // update sql here
    setStep("confirm");
    setModalContent(confirmModalContent);
  }, [successCams, confirmModalContent, setStep, setModalContent]);

  const onConfirm = useCallback(async () => {
    console.log("Confirming devices...");
    console.log(scanData);
    const successCamsArray = [];
    const failedCamsArray = [];

    try {
      await Promise.all(
        scanData.map(async (camera) => {
          try {
            const response = await axios.post(
              localStorage.getItem("cfUrl") + "camera/credentials",
              {
                ip: camera.ip,
                mac: camera.mac,
                vendor_name: camera.vendor_name,
                username: camera.username,
                password: camera.password,
              }
            );
            console.log("POST response:", response);
            successCamsArray.push(camera);
          } catch (postError) {
            if (
              postError.response &&
              postError.response.data === "Camera already exists"
            ) {
              try {
                const response = await axios.put(
                  localStorage.getItem("cfUrl") + "camera/credentials",
                  {
                    ip: camera.ip,
                    mac: camera.mac,
                    vendor_name: camera.vendor_name,
                    username: camera.username,
                    password: camera.password,
                  }
                );
                console.log("PUT response:", camera, response);
                successCamsArray.push(camera);
              } catch (putError) {
                console.error("PUT error:", camera, putError);
                failedCamsArray.push(camera);
              }
            } else {
              console.error("POST error:", camera, postError);
              failedCamsArray.push(camera);
            }
          }
        })
      );

      setSuccessCams(successCamsArray);
      setFailedCams(failedCamsArray);
    } catch (error) {
      console.error("Error occurred during confirmation:", error);
    }

    console.log(successCamsArray);
    console.log(failedCamsArray);
  }, [scanData]);

  const editModalContent = useMemo(() => {
    function getEditModalContent(scanData) {
      if (!scanData) return <h1>Scanning...</h1>;
      return (
        <React.Fragment>
          {scanData?.length === 0 && <h1>No devices found!</h1>}
          {scanData?.length > 0 && (
            <React.Fragment>
              <div className="flex space-x-2">
                <span className="w-[10%] font-semibold">IP</span>
                <span className="w-[15%] font-semibold">Mac Address</span>
                <span className="w-[24%] font-semibold">Vendor</span>
                <span className="w-[15%] font-semibold">Username</span>
                <span className="w-[15%] font-semibold">Password</span>
              </div>
              {scanData.map((device, i) => {
                return (
                  <div key={i} className="flex space-x-2 items-center">
                    <span className="w-[10%]">{device.ip}</span>
                    <span className="w-[15%]">{device.mac}</span>
                    <span className="w-[24%]">{device.vendor_name}</span>
                    {!successCams.includes(scanData[i]) && (
                      <Fragment>
                        <input
                          type="text"
                          placeholder="Username"
                          className="w-[15%] text-black"
                          value={scanData[i].username}
                          onChange={(e) => onUsernameChange(e, i)}
                        />
                        <input
                          type="text"
                          placeholder="Password"
                          className="w-[15%] text-black"
                          value={scanData[i].password}
                          onChange={(e) => onPasswordChange(e, i)}
                        />
                        <button
                          type="button"
                          className="bg-[#26272f] rounded-full text-white font-semibold px-2 h-7"
                          onClick={() => onValidate(i)}
                        >
                          Validate
                        </button>
                        <button
                          type="button"
                          className="bg-[#26272f] rounded-full text-white font-semibold px-2 h-7"
                          onClick={() => onDelete(i)}
                        >
                          Delete
                        </button>
                      </Fragment>
                    )}
                    {successCams.includes(scanData[i]) && (
                      <Fragment>
                        <span className="w-[15%]">{scanData[i].username}</span>
                        <span className="w-[15%]">{scanData[i].password}</span>
                        <div className="flex grow justify-end">
                          <CheckCircleIcon color="success" />
                        </div>
                      </Fragment>
                    )}
                    {failedCams.includes(scanData[i]) && (
                      <DisabledByDefaultIcon sx={{ color: red[500] }} />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          )}
          <div className="self-end space-x-4">
            {/* <button
              type="button"
              className="bg-[#26272f] rounded-full text-white font-semibold py-2 px-4 self-end"
              onClick={onConfirm}
            >
              Validate All
            </button> */}
            <button
              type="button"
              className="bg-[#26272f] rounded-full text-white font-semibold py-2 px-4 self-end"
              onClick={onContinue}
            >
              Continue
            </button>
          </div>
        </React.Fragment>
      );
    }
    return getEditModalContent(scanData);
  }, [
    scanData,
    successCams,
    failedCams,
    onValidate,
    onDelete,
    onConfirm,
    onContinue,
  ]);

  useEffect(() => {
    if (step === "edit") setModalContent(editModalContent);
    else if (step === "confirm") setModalContent(confirmModalContent);
  }, [step, editModalContent, confirmModalContent]);

  return (
    <React.Fragment>
      <button
        type="button"
        className="py-2 px-8 bg-[#26272f] rounded-full text-white font-semibold"
        onClick={onScan}
      >
        Scan Devices
      </button>
      <Modal
        isOpen={scanModalIsOpen}
        onRequestClose={onFinish}
        contentLabel="Scan Device Modal"
        className="bg-[#4f5263] w-full md:w-4/5 md:h-11/12 overflow-auto text-white rounded-xl"
        style={customStyles}
      >
        <div className="flex bg-[#26272f] justify-between py-2 px-4">
          <h2 className="font-semibold text-xl">Scanned Devices</h2>
          <button
            type="button"
            onClick={closeScanModal}
            className="font-semibold text-xl"
          >
            X
          </button>
        </div>
        <div className="flex flex-col space-y-3 px-5 py-2 pb-4">
          {modalContent}
        </div>
      </Modal>
    </React.Fragment>
  );
}
