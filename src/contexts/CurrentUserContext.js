import { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  
  const isRefreshingToken = useRef(false);
  const failedRequestsQueue = useRef([]);

  const handleSignOut = useCallback(async () => {
    try {
      await axios.post("/dj-rest-auth/logout/");
      setCurrentUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      history.push("/signin");
    } catch (err) {
      console.log(err);
    }
  }, [history]);

  const handleMount = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const { data } = await axiosRes.get("dj-rest-auth/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(data);
      } catch (err) {
        console.log(err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    handleMount();
  }, []);

  useMemo(() => {
    const requestInterceptor = axiosReq.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseInterceptor = axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
          if (!isRefreshingToken.current) {
            isRefreshingToken.current = true;
            originalRequest._retry = true;

            try {
              const refreshToken = localStorage.getItem("refreshToken");
              const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
                refresh: refreshToken,
              });

              const newToken = data.access_token;
              localStorage.setItem("authToken", newToken);
              isRefreshingToken.current = false;

              failedRequestsQueue.current.forEach((req) => req.onSuccess(newToken));
              failedRequestsQueue.current = [];

              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosRes(originalRequest);
            } catch (refreshErr) {
              handleSignOut();
              failedRequestsQueue.current.forEach((req) => req.onFailure(refreshErr));
              failedRequestsQueue.current = [];
            }
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.current.push({
              onSuccess: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axiosRes(originalRequest));
              },
              onFailure: (err) => reject(err),
            });
          });
        }

        return Promise.reject(err);
      }
    );

    return () => {
      axiosReq.interceptors.request.eject(requestInterceptor);
      axiosRes.interceptors.response.eject(responseInterceptor);
    };
  }, [handleSignOut]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
