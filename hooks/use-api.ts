import { useState, useCallback } from "react";
import { loadState, saveState } from "../store/stateLoader";
import toast from "react-hot-toast";

type RequestConfig = {
  url: string;
  method?: "POST" | "GET" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: FormData;
};

type Cache =
  | {
      url: string;
      response: any;
      time: number;
      isError: boolean;
    }
  | undefined;

const stateName = "cacheState";

const isLocal = !process.env.NEXT_PUBLIC_PRODUCTION;
const apiURL = process.env.NEXT_PUBLIC_API_URL;
const cache: Cache[] = loadState([], stateName);
const CACHE_SIZE: number = 3;
const CACHE_DELAY: number = 500;

const addCache = (url: string, response: any, isError: boolean) => {
  const time = Date.now();
  const cachedIndex = cache.findIndex((c) => c?.url == url);
  if (cachedIndex >= 0) {
    if (time - cache[cachedIndex]!.time > CACHE_DELAY)
      cache[cachedIndex]!.time = time;
  } else {
    if (cache.length >= CACHE_SIZE) cache.shift();

    cache.push({
      url,
      response,
      time,
      isError,
    });
  }

  saveState(cache, stateName);
};

const checkCache = (url: string) => {
  const curTime = Date.now();
  const curCache: Cache = cache.find(
    (c) => c?.url == url && curTime - c?.time < CACHE_DELAY
  );
  return curCache;
};

const useAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = useCallback(
    async (
      requestConfig: RequestConfig,
      onSuccess: <T>(data: T) => void,
      onError?: (errorMsg: string) => void
    ) => {
      const curCache: Cache = checkCache(requestConfig.url);

      if (curCache != undefined) {
        if (curCache.isError) {
          if (onError) onError(curCache.response);
          else toast.error(curCache.response);
        } else {
          onSuccess(curCache.response);
        }
      } else {
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
            addCache(requestConfig.url, data.error, true);
            if (onError) {
              onError(data.error);
            } else {
              toast.error(data.error);
            }
          } else {
            addCache(requestConfig.url, data, false);
            onSuccess(data);
          }
        } catch (err) {
          if (onError) {
            let errorMsg = "Something went wrong!";
            if (err instanceof Error)
              errorMsg = err.message || "Something went wrong!";

            onError(errorMsg);
            addCache(requestConfig.url, errorMsg, true);
          } else {
            if (err instanceof Error) {
              addCache(requestConfig.url, err.message, true);
              toast.error(err.message);
            }
          }
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
