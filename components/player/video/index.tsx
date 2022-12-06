import React, { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";

import classNames from "classnames/bind";
import styles from "./video.module.scss";

const cn = classNames.bind(styles);

type VideoType = {
  playing: boolean;
  curTime: number;
  src: string;
};

type DraggableEventHandler = (e: Event, data: DraggableData) => void | false;
type DraggableData = {
  node: HTMLElement;
  // lastX + deltaX === x
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};

function VideoPlayer(props: VideoType) {
  const { playing, curTime, src } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapper = useRef<HTMLDivElement>(null);

  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  useEffect(() => {
    if (!videoRef.current) return;

    if (playing) videoRef.current.play();
    else videoRef.current.pause();
    videoRef.current.currentTime = curTime;
  }, [playing, curTime]);

  const onDragStop: DraggableEventHandler = (e: Event, data: DraggableData) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  const reset = () => {
    setPositionX(0);
    setPositionY(0);

    videoWrapper.current!.style.height = "auto";
    videoWrapper.current!.style.width = "200px";
    videoWrapper.current!.classList.remove(cn("video-player__dragged"));
  };

  const handleSelector = cn("handle");

  return (
    <Draggable
      bounds="body"
      nodeRef={videoWrapper}
      onStop={onDragStop}
      handle={`.${handleSelector}`}
      position={{ x: positionX, y: positionY }}
      defaultClassNameDragged={cn("video-player__dragged")}
    >
      <div className={cn("video-player")} ref={videoWrapper}>
        <div className={handleSelector} />
        <div className={cn("video-player__reset-position")} onClick={reset} />
        <video
          className={cn("video-player__video")}
          src={src}
          muted
          ref={videoRef}
        ></video>
      </div>
    </Draggable>
  );
}

export default VideoPlayer;
