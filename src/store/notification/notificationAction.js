import { notificationAction } from "./notification";
import notificationApi from "../../apis/notification";

export const getSeveritiesLabel = (state, value) => {
  const severities = [...state.notification.severities];
  const severity = severities.find((option) => option.value === value);
  const lavel = severity ? severity.label : value;

  return lavel;
};

export const getNotificationTypesLabel = (state, value) => {
  const notificationTypes = [...state.notification.notificationTypes];
  const notificationType = notificationTypes.find(
    (option) => option.value === value
  );

  const lavel = notificationType ? notificationType.label : value;

  return lavel;
};

export const getNotifications = () => {
  return async (dispatch) => {    
    try {
      const respose = await notificationApi.getNotificationsFromServer();     
      dispatch(notificationAction.replaceNotification(respose));     
    } catch (err) {       
      console.log(err);
    }
  };
};

export const setNotificationsByBatch = (startIndex, endIndex) => {
    return  (dispatch) => {       
      try {        
        dispatch(notificationAction.setNotificationsByBatch(startIndex, endIndex));
      } catch (err) {
        console.log(err);
      }
    };
  };