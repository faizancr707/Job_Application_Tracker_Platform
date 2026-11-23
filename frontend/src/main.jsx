import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { Toaster } from './components/ui/sonner.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

axios.defaults.withCredentials = true;

// Global 401 response interceptor: redirect to login when unauthenticated
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
        const message = error.response.data?.message?.toLowerCase() || '';
        if (
          message.includes('login') ||
          message.includes('token') ||
          message.includes('unauthorized') ||
          error.config?.method !== 'get'
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
