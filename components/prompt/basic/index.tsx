import React from "react";

import classNames from "classnames/bind";
import styles from "./prompt.module.scss";

const cn = classNames.bind(styles);

type PromptType = {
  children: any;
  onDeny: () => void;
};

function BasicPrompt(props: PromptType) {
  return (
    <>
      <div className={cn("card", "prompt-window")}>
        {props.children}
        <div className={cn("prompt-window__close")} onClick={props.onDeny} />
      </div>
      <div className={cn("overlay")} onClick={props.onDeny} />
    </>
  );
}

export default BasicPrompt;
