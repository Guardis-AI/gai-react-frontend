import { createSlice } from "@reduxjs/toolkit";
import notificationApi from "../../apis/notification";

// 4. Create a slice for the state and reducers
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    data: [],
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
      { label: "Normal", value: "normal", isDisabled :true },
    ],
    severities: [
      { label: "Information", value: "INFORMATION", color: "#30ac64" },
      { label: "Warning", value: "WARNING", color: "#FF7518" },
      { label: "Critical", value: "CRITICAL", color: "#FF0000" },
    ],
  },
  reducers: {
    // async getNotifications(state) {
    //   state.data = await notificationApi.getNotificationsFromServer();
    // },
  },
  extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchItems.pending, (state) => {
  //       state.status = 'loading';
  //     })
  //     .addCase(fetchItems.fulfilled, (state, action) => {
  //       state.status = 'succeeded';
  //       state.data = action.payload;
  //     })
  //     .addCase(fetchItems.rejected, (state, action) => {
  //       state.status = 'failed';
  //       state.error = action.error.message;
  //     });
  },
});

export const notificationAction = notificationSlice.actions;

export default notificationSlice;
