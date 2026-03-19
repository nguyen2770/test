import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import { SchedulePreventiveTaskProvider } from "./contexts/schedulePreventiveTaskContext";
import { SchedulePreventiveProvider } from "./contexts/schedulePreventiveContext";
import { PermissionProvider } from "./contexts/permissionContext";
import { CalibrationGroupProvider } from "./contexts/calibrationWorkContext";
import { FooterProvider } from "./contexts/footerContext";
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './config-translation'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <PermissionProvider>
        <FooterProvider>
          <SchedulePreventiveProvider>
            <SchedulePreventiveTaskProvider>
              <CalibrationGroupProvider>
                <Routes>
                  <Route path="*" element={<App />} />
                </Routes>
              </CalibrationGroupProvider>
            </SchedulePreventiveTaskProvider>
          </SchedulePreventiveProvider>
        </FooterProvider>
      </PermissionProvider>
    </AuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// serviceWorkerRegistration.register();
reportWebVitals();
