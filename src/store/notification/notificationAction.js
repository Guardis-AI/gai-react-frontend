import { notificationAction } from "./notification";

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
