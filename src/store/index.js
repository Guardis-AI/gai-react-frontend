import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import notificationSlice from "./notification/notification";
import cameraSlice from "./camera/camera";

const store = configureStore({
  reducer: {
    notification: notificationSlice.reducer,
    camera: cameraSlice.reducer,
  },
});

export default store;
