import React from "react";
import type { WithTranslation } from "next-i18next";
import Image from "next/image";

import classNames from "classnames/bind";
import styles from "./delete.module.scss";
import BasicPrompt from "../basic";
import MainBtn from "../../mainBtn/mainBtn";

const cn = classNames.bind(styles);

type PromptType = {
  onAccept: <T>(params: T) => void;
  onDeny: () => void;
};

function DeletePrompt(props: PromptType & WithTranslation) {
  const { t } = props;

  return (
    <BasicPrompt onDeny={props.onDeny}>
      <div className={cn("delete-block")}>
        <h1>{t("delete_prompt.title")}</h1>
        <p>{t("delete_prompt.text")}</p>
        <MainBtn
          text={t("delete_prompt.delete")}
          class={cn("delete")}
          onClickCallback={props.onAccept}
        />
        <div className={cn("image")}>
          <Image
            src="/images/deletePrompt.png"
            alt="export"
            width={250}
            height={250}
            sizes="25vw"
            priority={true}
            objectFit="contain"
          />
        </div>
      </div>
    </BasicPrompt>
  );
}

export default DeletePrompt;
