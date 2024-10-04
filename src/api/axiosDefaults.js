import axios from "axios";

axios.defaults.baseURL = "https://project5-api-a299de19cbb3.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
axios.defaults.withCredentials = true;