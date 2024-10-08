import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();
  
  const isRefreshingToken = useRef(false);
  const failedRequestsQueue = useRef([]);

  const handleSignOut = async () => {
    try {
      // Perform logout on the server
      await axios.post("/dj-rest-auth/logout/");
      
      // Clear the tokens in React state
      setCurrentUser(null);
      
      // Explicitly clear the tokens from cookies
      document.cookie = "my-app-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "my-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Optionally, remove tokens from localStorage/sessionStorage if used
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
  
      // Redirect user to sign-in page
      history.push("/signin");
    } catch (err) {
      console.log(err);
    }
  };

  const handleMount = async () => {
    try {
      const { data } = await axiosRes.get("dj-rest-auth/user/");
      setCurrentUser(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleMount();
  }, []);

  useMemo(() => {
    // Interceptor for request
    const requestInterceptor = axiosReq.interceptors.request.use(
      async (config) => {
        try {
          await axios.post("/dj-rest-auth/token/refresh/");
        } catch (err) {
          setCurrentUser(null);
          history.push("/signin");
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Interceptor for response
    const responseInterceptor = axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
          if (!isRefreshingToken.current) {
            isRefreshingToken.current = true;
            originalRequest._retry = true;

            try {
              await axios.post("/dj-rest-auth/token/refresh/");
              isRefreshingToken.current = false;

              // Process failed requests in queue
              failedRequestsQueue.current.forEach((req) => req.onSuccess());
              failedRequestsQueue.current = [];
              
              return axiosRes(originalRequest);
            } catch (refreshErr) {
              setCurrentUser(null);
              history.push("/signin");
              failedRequestsQueue.current.forEach((req) => req.onFailure(refreshErr));
              failedRequestsQueue.current = [];
            }
          }

          // Queue the failed request while token is refreshing
          return new Promise((resolve, reject) => {
            failedRequestsQueue.current.push({
              onSuccess: () => resolve(axiosRes(originalRequest)),
              onFailure: (refreshErr) => reject(refreshErr),
            });
          });
        }

        return Promise.reject(err);
      }
    );

    // Cleanup interceptors
    return () => {
      axiosReq.interceptors.request.eject(requestInterceptor);
      axiosRes.interceptors.response.eject(responseInterceptor);
    };
  }, [history]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
