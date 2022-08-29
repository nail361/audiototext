import React from "react";
import type { WithTranslation } from "next-i18next";

import classNames from "classnames/bind";
import styles from "./prompt.module.scss";

const cn = classNames.bind(styles);

type PromptType = {
  onAccept: <T>(params: T) => void;
  onDeny?: () => void;
  title: string;
  text: string;
};

function Prompt(props: PromptType & WithTranslation) {
  const { t } = props;

  return (
    <>
      <div className={cn("card", "prompt-window")}>
        <div className={cn("header")}>
          <h1>{props.title}</h1>
        </div>
        <div className={cn("main")}>
          <p>{props.text}</p>
        </div>
        <div className={cn("footer")}>
          {props.onDeny && (
            <button
              className={cn("btn", "footer__deny-btn")}
              onClick={props.onDeny}
            >
              {t("prompt.deny", { ns: "common" })}
            </button>
          )}
          <button
            className={cn("btn", "footer__accept-btn")}
            onClick={props.onAccept}
          >
            {t("prompt.accept", { ns: "common" })}
          </button>
        </div>
      </div>
      <div className={cn("overlay")} />
    </>
  );
}

export default Prompt;
