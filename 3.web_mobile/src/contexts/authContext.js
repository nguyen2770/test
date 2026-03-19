import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEY } from "../utils/constant";
import * as _unitOfWork from "../api";
import { useNavigate } from "react-router-dom";
import usePermission from "./permissionContext";
import de from "date-fns/esm/locale/de/index.js";
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState();
  const [user, setUser] = useState();
  const navigator = useNavigate();
  const login = async (dataLogin) => {
    localStorage.setItem(
      STORAGE_KEY.USER,
      JSON.stringify({ ...dataLogin.user })
    );
    localStorage.setItem(STORAGE_KEY.TOKEN, dataLogin.tokens.access.token);
    localStorage.setItem(
      STORAGE_KEY.REFRESH_TOKEN,
      dataLogin.tokens.refresh.token
    );
    await fetchUserPermission();
    // save deviceToken
    var deviceToken = localStorage.getItem(STORAGE_KEY.DEVICE_TOKEN);
    if (deviceToken) {
      let res = await _unitOfWork.user.saveDeviceMobile({
        deviceMobile: {
          deviceToken: deviceToken,
          user: dataLogin.user?.id
        }
      })
    }
    window.location.reload();
  };
  const fetchUserPermission = async () => {
    let res = await _unitOfWork.user.getPermissisonByUsers();
    if (res && res.code === 1) {
      localStorage.setItem(STORAGE_KEY.PERMISSION, JSON.stringify(res.data));
    }
  };
  const logout = async () => {
    var deviceToken = localStorage.getItem(STORAGE_KEY.DEVICE_TOKEN);
    if (deviceToken) {
      let res = await _unitOfWork.logoutMobile({
        deviceToken: deviceToken
      })
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY.BRANCHS);
    localStorage.removeItem(STORAGE_KEY.BRANCH_CHANGE);
    localStorage.removeItem(STORAGE_KEY.COMPANY_SETTING);
    localStorage.removeItem(STORAGE_KEY.FOOTER_ACTIVE);
    localStorage.removeItem(STORAGE_KEY.PERMISSION);
    localStorage.removeItem(STORAGE_KEY.SUSBSCRIPTION_ID);
    localStorage.removeItem(STORAGE_KEY.TOKEN);
    localStorage.removeItem(STORAGE_KEY.USER);
    setToken(null);
    navigator("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY.TOKEN);
    const user = localStorage.getItem(STORAGE_KEY.USER);
    try {
      const userObj = JSON.parse(user);

      setUser(userObj);
    } catch (error) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY.USER);
    }
    setToken(token || null);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: typeof token === "undefined" ? undefined : !!token,
        user,
        login,
        logout,
        token,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
