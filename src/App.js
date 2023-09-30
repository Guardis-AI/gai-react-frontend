import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages";
import User from "./pages/user";
import Live from "./pages/live";
import Playback from "./pages/playback";
import Notifications from "./pages/notifications";
import LogIn from "./pages/log-in";
import SignOut from "./pages/signout";

function App() {
  return (
    <div className="App h-screen">
      <Navbar />
      <main className="w-full">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/live" element={<Live />} />
          <Route path="/playback" element={<Playback />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/log-in" element={<LogIn />} />
          <Route path="/sign-out" element={<SignOut />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
