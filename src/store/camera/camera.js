import { createSlice } from "@reduxjs/toolkit";

const cameraSlice = createSlice({
  name: "camera",
  initialState: {
    cameraList: [],
  },
  reducers: {
    replaceCameras(state, action) {
      state.cameraList = action.payload;
    },
    getCameraName(state, action) {
      let result = "Generic";
      if (state.cameraList) {
        const camera = state.cameraList.find((c) => c.mac === action.payload);
        result = camera ? camera.name : result;      }

      return result;
    },
  },
});

export const cameraAction = cameraSlice.actions;
export default cameraSlice;


