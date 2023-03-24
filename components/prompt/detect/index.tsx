import React from "react";
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
  lang: string;
  cost: number;
  onAccept: <T>(params: T) => void;
  onDeny: () => void;
};

function DetectPrompt(props: PromptType & WithTranslation) {
  const { t } = props;
  const duration = getStringTime(props.duration);

  return (
    <BasicPrompt onDeny={props.onDeny}>
      <div className={cn("detect-block")}>
        <h1>{t("detect_prompt.title")}</h1>
        <div className={cn("detect-block__column")}>
          <p>
            <span className={cn("detect-block__column__title")}>
              {t("table.date")}
            </span>
            <span>{props.date}</span>
          </p>
          <p>
            <span className={cn("detect-block__column__title")}>
              {t("table.name")}
            </span>
            <span>{props.name}</span>
          </p>
          <p>
            <span className={cn("detect-block__column__title")}>
              {t("table.duration")}
            </span>
            <span>{duration}</span>
          </p>
          <p>
            <span className={cn("detect-block__column__title")}>
              {t("table.lang")}
            </span>
            <span>{props.lang}</span>
          </p>
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
