//@ts-ignore
import { v4 as uuidv4 } from "uuid";

export const generateUniqId = () => {
  return uuidv4();
};

export const getStringTime = (time: number): string => {
  let seconds: number = time | 0;
  let minutes: number = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  const hours: number = Math.floor(minutes / 60);
  minutes -= hours * 60;

  if (hours === 0) return `${minutes}:${(seconds % 60).toFixed(0)}`;
  return `${hours.toFixed(0)}:${minutes}:${(seconds % 60).toFixed(0)}`;
};
