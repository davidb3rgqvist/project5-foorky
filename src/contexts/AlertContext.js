// import React, { createContext, useContext, useState } from "react";
// import { Alert } from "react-bootstrap";

// // Create a context for alerts
// const AlertContext = createContext();

// // Create a custom hook to use the Alert context
// export const useAlert = () => useContext(AlertContext);

// export const AlertProvider = ({ children }) => {
//   const [alerts, setAlerts] = useState([]);

//   // Add a new alert
//   const addAlert = (variant, message) => {
//     setAlerts((prevAlerts) => [...prevAlerts, { variant, message }]);

//     // Automatically remove the alert after 3 seconds
//     setTimeout(() => {
//       setAlerts((prevAlerts) => prevAlerts.slice(1));
//     }, 3000); // Adjust the timeout duration if needed
//   };

//   return (
//     <AlertContext.Provider value={{ addAlert }}>
//       {children}
//       <div style={{ position: "fixed", top: 0, right: 0, zIndex: 1000 }}>
//         {alerts.map((alert, idx) => (
//           <Alert key={idx} variant={alert.variant}>
//             {alert.message}
//           </Alert>
//         ))}
//       </div>
//     </AlertContext.Provider>
//   );
// };
