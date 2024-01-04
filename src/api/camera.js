import axios from "axios";

export default {
  getCameras() {
    const request =  axios
    .get(localStorage.getItem("cfUrl") + "camera/credentials")
    .then(function (response) {
      if (response == null) {
        console.log("No devices found!");
        return null;
      } else {
        const camera_list = response.data.map((camera) => {
          return {
            uuid: camera.uuid,
            name: camera.name,
            mac: camera.mac,
            editMode: false,
          };
        });

        return camera_list;
      }
    })
    .catch(function (error) {
      console.log(error);
    });

    return request;
  },
 async renameCamera(camera) {
   
   const request = axios
      .put(localStorage.getItem("cfUrl") + "camera/credentials", {
        mac: camera.mac,
        name: camera.name,
        uuid: camera.uuid,
      })
      .then(function (response) {
        if (response == null) {
          console.log("No devices found!");
        } else {
          const camera_list = response.data.map((camera) => {
            return {
              uuid: camera.uuid,
              name: camera.name,
              mac: camera.mac,
              editMode: false,
            };
          });
          return camera_list;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

   const result = await request;

   return result;
  }
};
