import React from "react";

import classNames from "classnames/bind";
import styles from "./simple.module.scss";
import BasicPrompt from "../basic";
import MainBtn from "../../mainBtn/mainBtn";

const cn = classNames.bind(styles);

type PromptType = {
  title: string;
  text: string;
  acceptText: string;
  onAccept: <T>(params: T) => void;
  onDeny: () => void;
};

function SimplePrompt(props: PromptType) {
  return (
    <BasicPrompt onDeny={props.onDeny}>
      <div className={cn("prompt-wrapper")}>
        <h1>{props.title}</h1>
        <p>{props.text}</p>
        <MainBtn
          text={props.acceptText}
          class={cn("delete")}
          onClickCallback={props.onAccept}
        />
      </div>
    </BasicPrompt>
  );
}

export default SimplePrompt;
