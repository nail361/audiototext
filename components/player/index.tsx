import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import { getStringTime } from "../../utils/utils";

import classNames from "classnames/bind";
import styles from "./player.module.scss";

const cn = classNames.bind(styles);

const VideoPlayer = React.lazy(() => import("./video"));

type PlayerType = {
  src: string;
  duration: number;
  withVideo: boolean;
  name?: string;
  correctedTime: number;
  onAudioProgress: (time: number) => void;
};

function Player(props: PlayerType) {
  const { correctedTime, onAudioProgress } = props;
  const [curTime, setCurTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(100);

  const onTimeUpdate = useCallback(() => {
    setCurTime(audioRef.current!.currentTime);
    onAudioProgress(audioRef.current!.currentTime);
  }, [onAudioProgress]);

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
  }, [audioRef, onTimeUpdate]);

  useEffect(() => {
    audioRef.current!.currentTime = correctedTime;
  }, [correctedTime]);

  const onAudioEnded = () => {
    setPlaying(false);
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

  const onTimeLineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const timelineWidth = event.currentTarget.offsetWidth;
    const timeToSeek =
      (event.nativeEvent.offsetX / timelineWidth) * audioRef.current.duration;

    audioRef.current.currentTime = timeToSeek;
    onAudioProgress(timeToSeek);
  };

  const onVolumeClick = () => {
    if (!audioRef.current) return;

    if (volume > 0) {
      setVolume(0);
      audioRef.current.volume = 0;
    } else {
      setVolume(50);
      audioRef.current.volume = 1;
    }
  };

  const onChangeVolume = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const sliderWidth = event.currentTarget.offsetWidth;
    const newVolume = event.nativeEvent.offsetX / sliderWidth;
    audioRef.current.volume = newVolume;
    setVolume(newVolume * 100);
  };

  const progressBarWidth = (currentTime: number): string => {
    if (!audioRef.current) return "";
    return (currentTime / audioRef.current.duration) * 100 + "%";
  };

  const memoizedDuration = useMemo(
    () => getStringTime(props.duration),
    [props.duration]
  );

  return (
    <>
      {props.withVideo && (
        <VideoPlayer playing={playing} curTime={curTime} src={props.src} />
      )}
      <div className={cn("audio-player")}>
        <audio
          ref={audioRef}
          preload="auto"
          className={cn("audio-player__audio")}
          src={props.src}
        ></audio>
        <div className={cn("audio-player__timeline")} onClick={onTimeLineClick}>
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
            <div className={cn("audio-player-length")}>{memoizedDuration}</div>
          </div>
          {props.name && (
            <div className={cn("audio-player__name")}>{props.name}</div>
          )}
          <div className={cn("audio-player-volume-container")}>
            <div
              className={cn("audio-player__volume-button")}
              onClick={onVolumeClick}
            >
              <div
                className={cn("audio-player__volume", {
                  "audio-player__volume_mute": volume == 0,
                })}
              />
            </div>

            <div
              className={cn("audio-player__volume-slider")}
              onClick={onChangeVolume}
            >
              <div
                className={cn("audio-player__volume-percentage")}
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function memoEqual(prevProps: PlayerType, nextProps: PlayerType) {
  return prevProps.correctedTime === nextProps.correctedTime;
}

export default React.memo(Player, memoEqual);
