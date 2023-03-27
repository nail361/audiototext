import React, { ChangeEvent, useState } from "react";
import type { WithTranslation } from "next-i18next";
import Image from "next/image";

import classNames from "classnames/bind";
import styles from "./detect.module.scss";
import BasicPrompt from "../basic";
import MainBtn from "../../mainBtn/mainBtn";
import { getStringTime } from "../../../utils/utils";

const cn = classNames.bind(styles);

type PromptType = {
  money: number;
  date: string;
  name: string;
  duration: number;
  cost: number;
  onAccept: <T>(params: T) => void;
  onDeny: () => void;
};

function DetectPrompt(props: PromptType & WithTranslation) {
  const { t } = props;
  const duration = getStringTime(props.duration);
  const [lang, setLang] = useState("ru");

  const onChangeLang = (event: ChangeEvent<HTMLInputElement>) => {
    setLang(event.target.name);
  };

  return (
    <BasicPrompt onDeny={props.onDeny} height="500px">
      <div className={cn("detect-block")}>
        <h1>{t("detect_prompt.title")}</h1>
        <div className={cn("detect-block__column")}>
          <div className={cn("detect-block__column__item")}>
            <span className={cn("detect-block__column__title")}>
              {t("table.date")}
            </span>
            <span>{props.date}</span>
          </div>
          <div className={cn("detect-block__column__item")}>
            <span className={cn("detect-block__column__title")}>
              {t("table.name")}
            </span>
            <span>{props.name}</span>
          </div>
          <div className={cn("detect-block__column__item")}>
            <span className={cn("detect-block__column__title")}>
              {t("table.duration")}
            </span>
            <span>{duration}</span>
          </div>
          <div className={cn("detect-block__lang-block")}>
            <span className={cn("detect-block__column__title")}>
              {t("table.lang")}
            </span>
            <div className={cn("detect-block__lang")}>
              <input
                type="radio"
                name="ru"
                id="langRadioRu"
                checked={lang == "ru"}
                onChange={onChangeLang}
              />
              <label
                className={cn("ru", { ru_checked: lang == "ru" })}
                htmlFor="langRadioRu"
              >
                Русский
              </label>
              <input
                type="radio"
                name="en"
                id="langRadioEn"
                checked={lang == "en"}
                onChange={onChangeLang}
              />
              <label
                className={cn("en", { en_checked: lang == "en" })}
                htmlFor="langRadioEn"
              >
                Английский
              </label>
            </div>
          </div>
          <div className={cn("cost-block")}>
            <p className={cn("cost-block__title")}>{t("table.cost")}</p>
            <p className={cn("cost-block__price")}>
              1,2руб/мин Х {duration} = {props.cost} руб.
            </p>
          </div>
          <MainBtn
            text={t("detect_prompt.detect")}
            class={cn("detect")}
            icon={"/icons/btn/fire.png"}
            onClickCallback={props.onAccept}
          />
        </div>
      </div>
      <div className={cn("detect-block__image")}>
        <Image
          src="/images/detectPrompt.png"
          alt="export"
          width={250}
          height={250}
          sizes="25vw"
          priority={true}
          objectFit="contain"
        />
      </div>
    </BasicPrompt>
  );
}

export default DetectPrompt;
