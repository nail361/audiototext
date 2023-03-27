import React from "react";

import classNames from "classnames/bind";
import styles from "./prompt.module.scss";

const cn = classNames.bind(styles);

type PromptType = {
  children: any;
  height?: string;
  onDeny: () => void;
};

function BasicPrompt(props: PromptType) {
  const popupHeight = props.height ? props.height : "";

  return (
    <>
      <div
        className={cn("card", "prompt-window")}
        style={{ height: popupHeight }}
      >
        {props.children}
        <div className={cn("prompt-window__close")} onClick={props.onDeny} />
      </div>
      <div className={cn("overlay")} onClick={props.onDeny} />
    </>
  );
}

export default BasicPrompt;
