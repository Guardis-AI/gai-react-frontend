import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    unreadCount: 0,
    notifications: [],
    allNotifications: [],
    notificationTypes: [
      { label: "Item Picking", value: "item_picking" },
      { label: "Bagging", value: "bagging" },
      { label: "Pocketing", value: "pocketing" },
      { label: "Enter Store", value: "enter_store" },
      { label: "Leave Store", value: "leave_store" },
      { label: "Pay Or Checkout", value: "pay/checkout" },
      { label: "No Action", value: "no_actiion" },
      { label: "Shoplift", value: "shoplift" },
      { label: "Phone Engagement", value: "phone_engagement" },
      { label: "Mishandling Documents", value: "mishandling_documents" },
      { label: "Cash theft", value: "cash_theft" },
      { label: "Activity After Hours", value: "activity_after_hours" },
      { label: "Idle", value: "Idle" },
      { label: "Money Handling", value: "money_handling" },
      { label: "Check/Document Handling", value: "Check_Document_Handling" },
      { label: "Normal", value: "normal", isDisabled: true },
    ],
    severities: [
      { label: "Information", value: "INFORMATION", color: "#30ac64" },
      { label: "Warning", value: "WARNING", color: "#FF7518" },
      { label: "Critical", value: "CRITICAL", color: "#FF0000" },
    ],
  },
  reducers: {
    replaceNotification(state, action) {
      state.unreadCount = action.payload.length;

      let notification_list = action.payload.map((notification) => {
        return {
          clip_id: notification.clip_id,
          camera_id: notification.camera_id,         
          sent_date: moment(notification.timestamp).format(
            "MM/DD/yyyy, h:mm:ss A"
          ),
          severity: notification.severity,
          user_feedback: notification.user_feedback,
          notification_type: notification.notification_type,
        };
      });

      notification_list = notification_list.sort(
        (a, b) => a.sent_date - b.sent_date
      );

      state.allNotifications = notification_list;
      state.notifications = notification_list.slice(0, 100);
    },
    setNotificationsByBatch(state, action) {
      state.notifications = [
        ...state.notifications.slice(
          action.payload.starIndex,
          action.payload.endIndex
        ),
      ];
    },
    setCameraNameInNotifications(state, action) {
      let all_notification = state.allNotifications.map((notification) => {
       return replaceCameraNameInNotifications(notification,  action.payload);
      });

      state.allNotifications = all_notification;

      let notification_list = state.notifications.map((notification) => {
        return replaceCameraNameInNotifications(notification, action.payload);
      });
      state.notifications = notification_list;
    }
  },
  // extraReducers: (builder) => {
  //   builder.addCase("notification/getNotifications", (state, action) => {
  //     state.notifications = action.payload;
  //   });
  // },
});

const replaceCameraNameInNotifications = (notification, cameraList)=>{ 
    let cameraname = "Generic";
    const camera = cameraList.find(
      (c) => c.mac === notification.camera_id
    );
    cameraname = camera ? camera.name : cameraname; 
}

export const notificationAction = notificationSlice.actions;

export default notificationSlice;
