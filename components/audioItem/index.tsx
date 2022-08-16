import React, { useRef, useState } from "react";
import Audio from "../../models/audio";

import classNames from "classnames/bind";
import styles from "./audioItem.module.scss";

import { WithTranslation } from "next-i18next";

const cn = classNames.bind(styles);

type AudioList = {
  onDetectAudio: (id: string) => void;
  onEditAudio: (id: string) => void;
  onDeleteAudio: (id: string) => void;
  detecting: false;
};

function AudioItem(props: Audio & AudioList & WithTranslation) {
  const { t } = props;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onPlayBtnHandler = () => {
    if (audioRef.current == null) return;

    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }

    setPlaying((prevState) => !prevState);
  };

  return (
    <div className={cn("row")}>
      <div
        className={cn("row__play-btn", {
          "row__play-btn_playing": playing,
        })}
        onClick={onPlayBtnHandler}
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
      <div className={cn("row__cell")}>
        {props.detecting && <span>loading</span>}
        {!props.ready && !props.detecting && (
          <>
            <select>
              <option value="ru">{t("language.ru")}</option>
              <option value="en">{t("language.en")}</option>
            </select>
            <div
              title={`${t("table.detect")} ${props.cost}руб.`}
              className={cn("row__detect")}
              onClick={() => props.onDetectAudio(props.id)}
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

export default AudioItem;
