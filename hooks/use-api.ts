import { useState, useCallback } from "react";
import toast from "react-hot-toast";

type RequestConfig = {
  url: string;
  method?: "POST" | "GET" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: FormData;
};

const isLocal = !process.env.NEXT_PUBLIC_PRODUCTION;
const apiURL = process.env.NEXT_PUBLIC_API_URL;

const useAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = useCallback(
    async (
      requestConfig: RequestConfig,
      onSuccess: <T>(data: T) => void,
      onError?: (errorMsg: string) => void
    ) => {
      setIsLoading(true);

      const url = apiURL + requestConfig.url;

      try {
        const response = await fetch(url, {
          method: requestConfig.method ? requestConfig.method : "POST",
          headers: requestConfig.headers ? requestConfig.headers : {},
          body: requestConfig.body ? requestConfig.body : null,
        });

        if (!response.ok) {
          throw new Error("Request failed!");
        }

        const data = await response.json();

        if (data.status == "error") {
          if (onError) onError(data.error);
        } else onSuccess(data);
      } catch (err) {
        if (onError) {
          if (err instanceof Error)
            onError(err.message || "Something went wrong!");
          else onError("Something went wrong!");
        } else {
          if (err instanceof Error) toast.error(err.message);
        }
      }

      setIsLoading(false);
    },
    []
  );

  return {
    isLoading,
    sendRequest,
  };
};

export default useAPI;
