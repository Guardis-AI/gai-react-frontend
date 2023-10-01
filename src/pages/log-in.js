import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Login from "../assets/images/login/Login.png";
import logoG from "../assets/images/login/logoG.png";
import Username1 from "../assets/images/logo/Username1.png";
import Passwords1 from "../assets/images/logo/Passwords1.png";
const baseUrlApi = process.env.REACT_APP_BASE_URL;

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
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
        console.log(response);
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
          navigate("/live");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div className="flex h-full w-full bg-[#e0e2da] place-content-center place-items-center">
      <div
        className="flex w-3/5 h-3/5 min-w-[760px] min-h-[400px] place-content-center place-items-center"
        // style={{ minHeight: "250px !important" }}
      >
        <div className="bg-white h-3/5 w-1/6">
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
        <div className="flex bg-white h-3/5 w-5/12 place-content-center place-items-center">
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
                className="w-60 loginbtn bg-[#da8511] rounded py-2"
              >
                <span className="w-60 text-white text-[14px] font-semibold">
                  LOGIN
                </span>
                <mat-progress-spinner></mat-progress-spinner>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
