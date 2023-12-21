import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Login from "../assets/images/login/Login.png";
import logoG from "../assets/images/login/logoG.png";
import Username1 from "../assets/images/logo/Username1.png";
import Passwords1 from "../assets/images/logo/Passwords1.png";
import Modal from "react-modal";
import ErrorMessageModal from "../components/ErrorMessageModal";
import InfoSharpIcon from "@mui/icons-material/InfoSharp";
import InfoOutlined from "@mui/icons-material/InfoRounded";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [popoverMessage, setPopoverMessage] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);  
  
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  let errorMessageModal = useRef(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    logIn(username, password);
  };

  function logIn(username, password) {
    axios
      .post(`${baseUrlApi}/api/user_api/gailoginv1`, {
        p_username: username,
        p_user_id: "NULL",
        p_password: password,
        p_device_type: "",
        p_handset_device_id: "",
        p_device_token: "",
        p_device_model: "",
        p_os_version: "",
        p_app_version: "",
      })
      .then(function (response) {
        // TODO: fix return to not leak information
        response = response.data.gai_login_v1;
        if (response.login_status === true) {
          // Store the access token , refresh Token in the local storage
          localStorage.setItem("accessToken", response.access_token);
          localStorage.setItem("refreshToken", response.refresh_token);
          localStorage.setItem("userId", response.user_id);
          localStorage.setItem("userName", response.user_name);
          localStorage.setItem("loginStatus", response.login_status);
          localStorage.setItem("startDate", response.user_st_date);
          localStorage.setItem("unitname", response.edgeunit);
          localStorage.setItem("cfUrl", response.cf_url);
          localStorage.setItem("Devices", response.user_devices);
          // Set the authenticated flag to true
          navigate("/");
        } else {
          openErrorModal("Invalid login");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  // Sign Up Modal
  const [signUpModalIsOpen, setSignUpModalIsOpen] = useState(false);

  function openSignUpModal() {
    setSignUpModalIsOpen(true);
  }

  function closeSignUpModal() {
    setSignUpModalIsOpen(false);
  }

  const [signUpFormData, setSignUpFormData] = useState({
    user_id: "",
    username: "",
    urole: "",
    password: "",
    passwordConfirm: "",
    cfurl: "",
    p_edgeunit: "",
    start_date: new Date(),
    end_date: "",
  });

  function handleSignUpFormChange(e) {
    setSignUpFormData({
      ...signUpFormData,
      [e.target.name]: e.target.value,
    });
  }

  async function onSignUp(e) {
    e.preventDefault();
    console.log("submitting sign up form: ");
    console.log(signUpFormData);

    if (await isValidCrfUrl(signUpFormData.cfurl)) {
      createNewUser(signUpFormData);
    } else {
      openErrorModal(`The url ${signUpFormData.cfurl} is invalid`);
    }
  }

  const isValidCrfUrl = async (url) => {
    let result = false;

    const response = axios
      .get(`${url}camera/ping`)
      .then(function (response) {
        console.log(response);
        return response.data == "PONG!";
      })
      .catch(function (error) {
        console.log(error);
        return false;
      });

    result = await response;
    return result;
  };

  const createNewUser = (user) => {
    axios
      .post(`${baseUrlApi}/api/user/insuser`, user)
      .then(function (response) {
        if (
          response.data?.gai_ins_user?.message ===
          '"The username already exist!"'
        ) {
          openErrorModal("The username already exist!");
        } else {
          console.log(response);
          logIn(user.username, user.password);
        }
      })
      .catch(function (error) {
        console.log(error);
        openErrorModal(error.message);
      });
  };

  function openErrorModal(message) {
    if (errorMessageModal.current) {
      setErrorMessage(message);
      errorMessageModal.current.openModal();
    }
  }

  const customStyles = {
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
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
    <div className="flex h-full w-full bg-[#e0e2da] place-content-center place-items-center overflow-hidden">
      <div className="flex w-3/5 h-5/6 md:h-3/5 min-w-[760px] min-h-[400px] place-content-center place-items-center">
        <div className="hidden md:block w-1/6 h-3/5 min-h-[300px] bg-white">
          <img className="pt-5" src={logoG} alt="Projecttitle" />
        </div>
        <div className="hidden md:block bg-[#26272f] h-full w-3/6 p-5">
          <div
            className="h-full w-full p-5"
            style={{
              backgroundImage: `url(${Login})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
            }}
          >
            <h2 className="text-white text-3xl">LOGIN</h2>
          </div>
        </div>

        <div className="flex flex-col bg-white h-5/6 md:h-3/5 w-5/12 place-content-center place-items-center min-h-[300px]">
          <div className="md:hidden flex w-full p-3 pb-0 justify-center items-center">
            <img className="w-11/12" src={logoG} alt="Projecttitle" />
          </div>

          <form
            className="p-3 pb-5 space-y-3"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div>
              <label className="text-xs">Username</label>
              <div className="flex place-items-center border-solid border-2 rounded border-gray-200 pr-1">
                <img
                  src={Username1}
                  className="p-2"
                  style={{ width: "35px" }}
                  alt="Username icon"
                />
                <input
                  className="grow"
                  placeholder="Username"
                  id="p_username"
                  maxLength="10"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
            </div>

            <div>
              <label className="text-xs">Password</label>
              <div className="flex place-items-center border-solid border-2 rounded border-gray-200 pr-1">
                <img
                  src={Passwords1}
                  className="p-2"
                  style={{ width: "35px" }}
                  alt="Password icon"
                />
                <input
                  className="grow"
                  placeholder="Password"
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  style={{ minHeight: "30px !important", height: "35px" }}
                  type="button"
                ></button>
              </div>
            </div>

            <div className="pt-[15px]">
              <button
                type="submit"
                className="w-60 loginbtn bg-[#da8511] rounded py-1"
              >
                <span className="w-60 text-white text-[14px] font-semibold">
                  LOGIN
                </span>
                <mat-progress-spinner></mat-progress-spinner>
              </button>
            </div>
            <hr className="border-gray-300" />
            <div>
              <button
                type="button"
                className="w-60 loginbtn bg-[#da8511] rounded py-1"
                onClick={openSignUpModal}
              >
                <span className="w-60 text-white text-[14px] font-semibold">
                  SIGN UP
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <Modal
        isOpen={signUpModalIsOpen}
        onRequestClose={closeSignUpModal}
        contentLabel="Sign Up Modal"
        className="bg-[#4f5263] w-3/12 h-11/12 overflow-auto text-white rounded-xl"
        style={customStyles}
        ariaHideApp={false}
      >
        <div className="flex bg-[#26272f] justify-between py-2 px-4">
          <h2 className="font-semibold text-xl">Sign Up</h2>
          <button onClick={closeSignUpModal} className="font-semibold text-xl">
            X
          </button>
        </div>
        <form
          className="flex flex-col space-y-3 px-5 py-2 pb-4"
          onSubmit={onSignUp}
        >
          <label className="flex flex-col w-full">
            Username
            <input
              type="text"
              name="username"
              value={signUpFormData.username}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          {/*<label className="flex flex-col w-3/5">
            User Role
            <input
              type="text"
              name="urole"
              value={signUpFormData.urole}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label> */}
          <label className="flex flex-col w-full">
            Password
            <input
              type="password"
              name="password"
              value={signUpFormData.password}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-full">
            Password (Confirm)
            <input
              type="password"
              name="passwordConfirm"
              value={signUpFormData.passwordConfirm}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-full">
            CF-Url
            <div className="flex space-x-1">
              <input
                type="text"
                name="cfurl"
                value={signUpFormData.cfurl}
                onChange={handleSignUpFormChange}
                className="text-black w-full"
              />
              <span>
                <InfoOutlined
                  className="bg-[#26272f] rounded-xl "
                  onMouseEnter={(e) =>
                    handlePopoverOpen(
                      e,
                      "Copy the code provided when you purchased your subscription. If a code was not provided, please contact customer support for assistance!"
                    )
                  }
                  onMouseLeave={() => handlePopoverClose(5000)}
                />
              </span>
            </div>
          </label>

          <label className="flex flex-col w-full">
            Unit Name
            <div className="flex space-x-1">
              <input
                type="text"
                name="p_edgeunit"
                value={signUpFormData.p_edgeunit}
                onChange={handleSignUpFormChange}
                className="text-black w-full"
              />
              <span>
                <InfoOutlined
                  className="rounded-xl bg-[#26272f] "
                  onMouseEnter={(e) =>
                    handlePopoverOpen(
                      e,
                      "Please add in your site address or other identifying information here!"
                    )
                  }
                  onMouseLeave={() => handlePopoverClose(5000)}
                />
              </span>
            </div>
          </label>
          <div className="flex flex-col w-full">
            <button
              type="submit"
              className="bg-[#30ac64] hover:bg-emerald-600  rounded-full text-white text-white font-bold py-2 px-4 rounded-full"
            >
              Save
            </button>
          </div>
        </form>
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
            <InfoSharpIcon sx={{ fontSize: 15, color:'#30ac64' }} ></InfoSharpIcon> {popoverMessage}
          </Typography>
        </Popover>
      </Modal>
      <ErrorMessageModal
        ref={errorMessageModal}
        Title={"Oops, That Didn't Work"}
        Message={errorMessage}
      />
    </div>
  );
}
