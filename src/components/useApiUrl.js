import React, { useEffect, useState } from "react";
import axios from "axios";

const useApiUrl = () => {
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    const fetchApiUrl = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-api-url");
        setApiUrl(res.data.API_URL);
      } catch (error) {
        console.error("Error fetching API URL:", error);
      }
    };

    fetchApiUrl();
  }, []);

  return apiUrl;
};

export default useApiUrl;

