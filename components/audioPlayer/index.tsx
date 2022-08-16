import React, { useEffect, useRef, useState } from "react";

import classNames from "classnames/bind";
import styles from "./audioPlayer.module.scss";

const cn = classNames.bind(styles);

type AudioElementType = {
  audioSrc: string;
  duration: string;
  name: string;
};

function AudioPlayer(props: AudioElementType) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [curTime, setCurTime] = useState<number>(0);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.addEventListener("ended", onAudioEnded);
      audio.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        audio.removeEventListener("ended", onAudioEnded);
        audio.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [audioRef]);

  const onAudioEnded = () => {
    setPlaying(false);
  };

  const onTimeUpdate = () => {
    setCurTime(audioRef.current!.currentTime);
  };

  const onPlayClickHandler = () => {
    if (audioRef.current == null) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }

    setPlaying((prevState) => !prevState);
  };

  const progressBarWidth = (currentTime: number): string => {
    if (!audioRef.current) return "";
    return (currentTime / audioRef.current.duration) * 100 + "%";
  };

  const getStringTime = (time: number): string => {
    let seconds: number = time;
    let minutes: number = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    const hours: number = Math.floor(minutes / 60);
    minutes -= hours * 60;

    if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
    return `${hours.toFixed(2)}:${minutes}:${(seconds % 60).toFixed(2)}`;
  };

  return (
    <div className={cn("audio-player")}>
      <audio
        ref={audioRef}
        preload="auto"
        className={cn("audio-player__audio")}
        src={props.audioSrc}
      ></audio>
      <div className={cn("audio-player__timeline")}>
        <div
          className={cn("audio-player__progress")}
          style={{ width: progressBarWidth(curTime) }}
        />
      </div>
      <div className={cn("audio-player__controls")}>
        <div className={cn("audio-player__play-container")}>
          <div
            onClick={onPlayClickHandler}
            className={cn("audio-player__toggle-play", {
              "audio-player__toggle-play_play": !playing,
              "audio-player__toggle-play_pause": playing,
            })}
          />
        </div>
        <div className={cn("audio-player-time")}>
          <div className={cn("audio-player-time__current")}>
            {getStringTime(curTime)}
          </div>
          <div className={cn("audio-player-time__divider")}>/</div>
          <div className={cn("audio-player-length")}>{props.duration}</div>
        </div>
        <div className={cn("audio-player__name")}>{props.name}</div>
        <div className={cn("audio-player-volume-container")}>
          <div className={cn("audio-player__volume-button")}>
            <div
              className={cn("audio-player__volume", {
                "audio-player__volume_medium": true,
              })}
            />
          </div>

          <div className={cn("audio-player__volume-slider")}>
            <div className={cn("audio-player__volume-percentage")} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
