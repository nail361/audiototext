import React, { useRef, useState, useEffect } from "react";
import Media from "../../models/complexMedia";
import Loader from "../loader";
import type { WithTranslation } from "next-i18next";

import classNames from "classnames/bind";
import styles from "./audioItem.module.scss";

const cn = classNames.bind(styles);

type MediaListType = {
  onDetectAudio: (id: string, cost: number) => void;
  onEditAudio: (id: string) => void;
  onDeleteAudio: (id: string) => void;
  detecting: boolean;
};

function MediaItem(props: Media & MediaListType & WithTranslation) {
  const { t } = props;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.addEventListener("ended", onAudioEnded);
      return () => audio.removeEventListener("ended", onAudioEnded);
    }
  }, [audioRef]);

  const onAudioEnded = () => {
    setPlaying(false);
  };

  const onPlayClickHandler = () => {
    if (audioRef.current == null) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlaying((prevState) => !prevState);
  };

  return (
    <div className={cn("row")}>
      <div
        className={cn("row__play-btn", {
          "row__play-btn_playing": playing,
        })}
        onClick={onPlayClickHandler}
      />
      <audio
        ref={audioRef}
        preload="none"
        className={cn("row__audio")}
        src={props.src}
      />
      <div className={cn("row__cell")}>{props.date}</div>
      <div className={cn("row__cell")}>{props.name}</div>
      <div className={cn("row__cell")}>{props.duration}</div>
      <div className={cn("row__cell")} style={{ position: "relative" }}>
        {props.detecting && <Loader overlay={false} top={"-20%"} />}
        {!props.ready && !props.detecting && (
          <>
            <select>
              <option value="ru">{t("language.ru")}</option>
              <option value="en">{t("language.en")}</option>
            </select>
            <div
              title={`${t("table.detect")} ${props.cost}руб.`}
              className={cn("row__detect")}
              onClick={() => props.onDetect(props.id, props.cost)}
            >
              {props.cost}
            </div>
          </>
        )}
        <div
          title={t("table.edit")}
          className={cn("row__edit", {
            row__edit_hide: !props.ready,
          })}
          onClick={() => props.onEditAudio(props.id)}
        ></div>
        <div
          title={t("table.delete")}
          className={cn("row__delete", {
            row__delete_hide: props.detecting,
          })}
          onClick={() => props.onDeleteAudio(props.id)}
        ></div>
      </div>
    </div>
  );
}

export default MediaItem;
