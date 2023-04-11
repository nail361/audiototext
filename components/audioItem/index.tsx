import React, { useRef, useState, useEffect } from "react";
import Audio from "../../models/complexAudio";
import Loader from "../loader";
import type { WithTranslation } from "next-i18next";

import { getStringTime } from "../../utils/utils";

import classNames from "classnames/bind";
import styles from "./audioItem.module.scss";

const cn = classNames.bind(styles);

type AudioListType = {
  onDetectAudio: (id: number) => void;
  onEditAudio: (id: number) => void;
  onDeleteAudio: (id: number) => void;
  detecting: boolean;
};

function AudioItem(props: Audio & AudioListType & WithTranslation) {
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

  const downloadAudio = () => {
    if (audioRef.current == null) return;

    const link = document.createElement("a");
    link.href = audioRef.current.src;
    link.click();
  };

  return (
    <div
      className={cn("row", { row_selected: !props.ready && !props.detecting })}
    >
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
      <div className={cn("row__cell", "row__cell_name")}>{props.name}</div>
      <div className={cn("row__cell", "row__cell_flag")}>
        <div
          className={cn("flag", {
            flag_ru: props.ready && props.lang != null && props.lang == "ru",
            flag_en: props.ready && props.lang != null && props.lang == "en",
          })}
        />
      </div>
      <div className={cn("row__cell", "row__cell_duration")}>
        {getStringTime(props.duration)}
      </div>
      <div className={cn("row__cell", "row__cell_date")}>{props.date}</div>
      <div
        className={cn("row__cell", "row__cell_actions")}
        style={{ position: "relative" }}
      >
        {props.detecting && <Loader overlay={false} top={"-20%"} />}
        {!props.ready && !props.detecting && (
          <>
            <div
              className={cn("row__detect")}
              onClick={() => props.onDetectAudio(props.id)}
            >
              {t("table.detect")}
            </div>
          </>
        )}
        {props.ready && (
          <>
            <div
              className={cn("row__edit")}
              onClick={() => props.onEditAudio(props.id)}
            >
              {t("table.edit")}
            </div>
            <div
              title={t("table.download")}
              className={cn("row__download")}
              onClick={downloadAudio}
            />
          </>
        )}
        <div
          title={t("table.delete")}
          className={cn("row__delete", {
            row__delete_hide: props.detecting,
          })}
          onClick={() => props.onDeleteAudio(props.id)}
        />
      </div>
    </div>
  );
}

export default AudioItem;
