import React from "react";
import "./App.css";
import { Navbar, MobileNavbar } from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages";
import Setup from "./pages/setup";
import Live from "./pages/live";
import Playback from "./pages/playback";
import Events from "./pages/events";
import Analytics from "./pages/analytics";
import LogIn from "./pages/log-in";
import SignOut from "./pages/signout";
import useWindowDimensions from "./utils/useWindowDimensions";

export default function App() {
  const { width } = useWindowDimensions();

  if (width >= 768)
    return (
      <div className="App h-screen">
        <Navbar />
        <main className="w-full">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/live" element={<Live />} />
            <Route path="/playback" element={<Playback />} />
            <Route path="/events" element={<Events />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/log-in" element={<LogIn />} />
            <Route path="/sign-out" element={<SignOut />} />
          </Routes>
        </main>
      </div>
    );

  return (
    <div className="App h-screen flex flex-col">
      <main className="w-full grow">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/live" element={<Live />} />
          <Route path="/playback" element={<Playback />} />
          <Route path="/events" element={<Events />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/log-in" element={<LogIn />} />
          <Route path="/sign-out" element={<SignOut />} />
        </Routes>
      </main>
      <MobileNavbar />
    </div>
  );
}
