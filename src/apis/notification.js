import axios from "axios";

export default {
  getNotificationsFromServer() {
    const request = axios
      .get(`${localStorage.getItem("cfUrl")}notifications`, null)
      .then(function (response) {
        if (response == null || response.data.length === 0) {
          console.log("No events found!");
          return null;
        } else {
          let notification_list = response.data.filter(
            (n) => n.user_feedback === null
          );

          return notification_list;
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    return request;
  },
};
