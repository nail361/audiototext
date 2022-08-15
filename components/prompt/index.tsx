import React from "react";
import type { WithTranslation } from "../../types/withTranslation";

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
              {props.t("prompt.deny", { ns: "common" })}
            </button>
          )}
          <button
            className={cn("btn", "footer__accept-btn")}
            onClick={props.onAccept}
          >
            {props.t("prompt.accept", { ns: "common" })}
          </button>
        </div>
      </div>
      <div className={cn("overlay")} />
    </>
  );
}

export default Prompt;
