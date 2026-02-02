import { useEffect, useState } from "react";
import { _get } from "../httpClient";

export const useConfig = () => {
  const [config, setConfig] = useState();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await _get("/api/config");
        setConfig(response);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };

    fetchConfig();
  }, [setConfig]);

  return config;
};

export default useConfig;
