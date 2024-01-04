import axios from "axios";

export default {
  async getNotifications() {
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

    const notifications = await request;

    return notifications;
  },

  async getNotificationTypes() {
    const request = axios
      .get(`${localStorage.getItem("cfUrl")}notifications/types`)
      .then(function (response) {
        if (response == null || response.data.length === 0) {
          console.log("No notifications types found!");
          return null;
        } else {
          const notificationTypes = response.data.sort((a, b) =>
            a.human_readable.localeCompare(b.human_readable)
          );

          return notificationTypes;
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    const notificationTypeList = await request;
    return notificationTypeList;
  },
};
