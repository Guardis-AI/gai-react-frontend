import React from "react";
import { NavLink } from "react-router-dom";

export default function SignOut() {
  return (
    <div className="flex py-2">
      <h1>Sign Out Successful</h1>
      <NavLink to="/log-in">Log In</NavLink>
    </div>
  );
}
