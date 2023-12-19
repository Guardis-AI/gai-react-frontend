import { configureStore, applyMiddleware  } from '@reduxjs/toolkit';
import notificationSlice from './notification/notification';
//import thunk from 'redux-thunk';

const store = configureStore({
    reducer: {
      notification: notificationSlice.reducer
    },
    
  });

  export default store;