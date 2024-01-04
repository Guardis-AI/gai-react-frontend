import { cameraAction } from "./camera";
import cameraApi from "../../api/camera";

export const getCameras = () => {
  return async (dispatch) => {    
    try {
      const respose = await cameraApi.getCameras();     
      dispatch(cameraAction.replaceCameras(respose));     
    } catch (err) {       
      console.log(err);
    }
  };
};

// export const getCameraName = (cameraId) => {
//   return async (dispatch) => {    
//     try {         
//      return dispatch(cameraAction.getCameraName(cameraId));     
//     } catch (err) {       
//       console.log(err);
//     }
//   };
// };