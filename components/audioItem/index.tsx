import React, { useState } from "react";
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

  return (
    <tr>
      <td>{props.date}</td>
      <td>{props.name}</td>
      <td>{props.duration}</td>
      <td>
        {props.detecting && <span>loading</span>}
        {!props.ready && !props.detecting && (
          <>
            <select>
              <option value="ru">{t("language.ru")}</option>
              <option value="en">{t("language.en")}</option>
            </select>
            <div
              title={`${t("detect")} ${props.cost}руб.`}
              className={cn("audio-list__detect")}
              onClick={() => props.onDetectAudio(props.id)}
            >
              {props.cost}
            </div>
          </>
        )}
        <div
          title={t("edit")}
          className={cn("audio-list__edit", {
            "audio-list__edit_hide": !props.ready,
          })}
          onClick={() => props.onEditAudio(props.id)}
        ></div>
        <div
          title={t("delete")}
          className={cn("audio-list__delete", {
            "audio-list__delete_hide": props.detecting,
          })}
          onClick={() => props.onDeleteAudio(props.id)}
        ></div>
      </td>
    </tr>
  );
}

export default AudioItem;
