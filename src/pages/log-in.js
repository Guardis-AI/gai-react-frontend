import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Login from "../assets/images/login/Login.png";
import logoG from "../assets/images/login/logoG.png";
import Username1 from "../assets/images/logo/Username1.png";
import Passwords1 from "../assets/images/logo/Passwords1.png";
import Modal from "react-modal";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

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
          alert("Invalid login");
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
  function onSignUp(e) {
    e.preventDefault();
    console.log("submitting sign up form: ");
    console.log(signUpFormData);
    axios
      .post(`${baseUrlApi}/api/user/insuser`, signUpFormData)
      .then(function (response) {
        console.log(response);
        logIn(signUpFormData.username, signUpFormData.password);
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

  return (
    <div className="flex h-full w-full bg-[#e0e2da] place-content-center place-items-center">
      <div
        className="flex w-3/5 h-3/5 min-w-[760px] min-h-[400px] place-content-center place-items-center"
        // style={{ minHeight: "250px !important" }}
      >
        <div className="bg-white h-3/5 w-1/6 min-h-[300px]">
          <img className="pt-5" src={logoG} alt="Projecttitle" />
        </div>
        <div className="bg-[#26272f] h-full w-3/6 p-5">
          <div
            className="h-full w-full p-5"
            style={{
              backgroundImage: `url(${Login})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
              //   backgroundPositionX: "41px",
              //   backgroundPositionY: "29px",
            }}
          >
            <h2 className="text-white text-3xl">LOGIN</h2>
          </div>
        </div>

        <div className="flex bg-white h-3/5 w-5/12 place-content-center place-items-center min-h-[300px]">
          <form
            className="p-3 pb-5 space-y-3"
            onSubmit={(e) => handleSubmit(e)}
          >
            {/* <fuse-alert className="mt-8 -mb-4">
                  {{ alert.message }}
                </fuse-alert> */}
            <div>
              <label className="text-xs">Username</label>
              <div className="flex place-items-center border-solid border-2 rounded border-gray-200 pr-1">
                {/* <mat-form-field className="w-60 text-[#0B3960] font-weight-20"> */}
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

                {/* <mat-error>Username is required</mat-error> */}
                {/* <mat-error>Please enter a valid username</mat-error> */}
                {/* </mat-form-field> */}
              </div>
            </div>

            <div>
              <label className="text-xs">Password</label>
              <div className="flex place-items-center border-solid border-2 rounded border-gray-200 pr-1">
                {/* <mat-form-field className="w-60 text-[#0B3960]"> */}
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
                >
                  {/* <mat-icon className="icon-size-5"></mat-icon> */}
                  {/* <mat-icon className="icon-size-5"></mat-icon> */}
                </button>
                {/* <mat-error> Password is required </mat-error> */}
                {/* </mat-form-field> */}
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

      {/* Sign Up Modal */}
      <Modal
        isOpen={signUpModalIsOpen}
        // onAfterOpen={afterOpenModal}
        onRequestClose={closeSignUpModal}
        contentLabel="Sign Up Modal"
        className="bg-[#4f5263] w-2/5 h-11/12 overflow-auto text-white rounded-xl"
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
          <label className="flex flex-col w-3/5">
            Username
            <input
              type="text"
              name="username"
              value={signUpFormData.username}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-3/5">
            User Role
            <input
              type="text"
              name="urole"
              value={signUpFormData.urole}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-3/5">
            Password
            <input
              type="password"
              name="password"
              value={signUpFormData.password}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-3/5">
            Password (Confirm)
            <input
              type="password"
              name="passwordConfirm"
              value={signUpFormData.passwordConfirm}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-3/5">
            CF-Url
            <input
              type="text"
              name="cfurl"
              value={signUpFormData.cfurl}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <label className="flex flex-col w-3/5">
            Unit Name
            <input
              type="text"
              name="p_edgeunit"
              value={signUpFormData.p_edgeunit}
              onChange={handleSignUpFormChange}
              className="text-black"
            />
          </label>
          <button
            type="submit"
            className="bg-[#26272f] rounded-full text-white font-semibold"
          >
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
