import React, { useEffect, useMemo, useState, useCallback } from "react";
import Modal from "react-modal";
import axios from "axios";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "Guardis123";

export default function ScanModalButton() {
  const [scanData, setScanData] = useState(null);
  const [scanModalIsOpen, setScanModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [step, setStep] = useState("edit");
  const [confirming, setConfirming] = useState(false);
  const [successCams, setSuccessCams] = useState([]);
  const [failedCams, setFailedCams] = useState([]);

  function openScanModal() {
    setScanModalIsOpen(true);
  }

  function closeScanModal() {
    setScanModalIsOpen(false);
  }

  function onScan() {
    console.log("Scanning devices...");
    setModalContent(editModalContent);
    setStep("edit");
    openScanModal();
    axios
      .get(localStorage.getItem("cfUrl") + "camera/scan")
      .then(function (response) {
        console.log(response.data);
        setScanData(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  const onDelete = useCallback((i) => {
    setScanData((prevScanData) =>
      prevScanData.filter((j) => prevScanData[i] !== j)
    );
  }, []);

  const customStyles = {
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const confirmModalContent = useMemo(() => {
    function getConfirmModalContent(confirming, successCams, failedCams) {
      if (confirming) return <h1>Confirming...</h1>;
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
        </React.Fragment>
      );
    }
    return getConfirmModalContent(confirming, successCams, failedCams);
  }, [confirming, successCams, failedCams]);

  const onConfirm = useCallback(async () => {
    console.log("Confirming devices...");
    console.log(scanData);
    setStep("confirm");
    setModalContent(confirmModalContent);
    setConfirming(true);

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
                username: DEFAULT_USERNAME,
                password: DEFAULT_PASSWORD,
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
                    username: DEFAULT_USERNAME,
                    password: DEFAULT_PASSWORD,
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

    setConfirming(false);
    console.log(successCamsArray);
    console.log(failedCamsArray);
    setScanData(null);
  }, [scanData, confirmModalContent, setStep, setModalContent, setConfirming]);

  const editModalContent = useMemo(() => {
    function getEditModalContent(scanData) {
      if (!scanData) return <h1>Scanning...</h1>;
      return (
        <React.Fragment>
          {scanData?.length === 0 && <h1>No devices found!</h1>}
          {scanData?.length > 0 && (
            <React.Fragment>
              <div className="flex">
                <span className="w-1/5 font-semibold">IP</span>
                <span className="w-2/5 font-semibold">Mac Address</span>
                <span className="w-2/5 font-semibold">Vendor</span>
              </div>
              {scanData.map((device, i) => {
                return (
                  <div key={i} className="flex">
                    <span className="w-1/5">{device.ip}</span>
                    <span className="w-2/5">{device.mac}</span>
                    <span className="w-2/5">{device.vendor_name}</span>
                    {/* <button className="bg-[#26272f] rounded-full text-white font-semibold px-2">
                      Edit
                    </button> */}
                    <button
                      className="bg-[#26272f] rounded-full text-white font-semibold px-2 ml-1"
                      onClick={() => onDelete(i)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </React.Fragment>
          )}
          <button
            type="button"
            className="bg-[#26272f] rounded-full text-white font-semibold py-2 px-4 mr-4 mb-4 self-end w-1/5"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </React.Fragment>
      );
    }
    return getEditModalContent(scanData);
  }, [scanData, onDelete, onConfirm]);

  useEffect(() => {
    if (step === "edit") setModalContent(editModalContent);
    else if (step === "confirm") setModalContent(confirmModalContent);
  }, [step, editModalContent, confirmModalContent]);

  return (
    <React.Fragment>
      <button
        className="px-8 bg-[#26272f] rounded-full text-white font-semibold"
        onClick={onScan}
      >
        Scan Devices
      </button>
      <Modal
        isOpen={scanModalIsOpen}
        onRequestClose={closeScanModal}
        contentLabel="Add Device Modal"
        className="bg-[#4f5263] w-3/5 h-11/12 overflow-auto text-white rounded-xl"
        style={customStyles}
      >
        <div className="flex bg-[#26272f] justify-between py-2 px-4">
          <h2 className="font-semibold text-xl">Scanned Devices</h2>
          <button onClick={closeScanModal} className="font-semibold text-xl">
            X
          </button>
        </div>
        {/* <div className="flex flex-col space-y-3 px-5 py-2 pb-4">
          {editModalContent}
        </div> */}
        <div className="flex flex-col space-y-3 px-5 py-2 pb-4">
          {modalContent}
        </div>
      </Modal>
    </React.Fragment>
  );
}
