import React, { SyntheticEvent, useEffect, useState } from "react";

import { textData } from "../../types/textData";

import classNames from "classnames/bind";
import styles from "./textBlock.module.scss";

const cn = classNames.bind(styles);

type textBlockType = textData & {
  inTime: boolean;
  onClickCallback: (id: string) => void;
  onChangeCallback: (id: string, text: string) => void;
};

function TextBlock(props: textBlockType) {
  const {
    id,
    text,
    originalText,
    confidence,
    startTime,
    endTime,
    inTime,
    onClickCallback,
    onChangeCallback,
  } = props;

  const onInput = (event: any) => {
    console.log("CHANGE1");
    event.preventDefault();
    console.log("CHANGE2");
    let newText = event.currentTarget.innerText;
    onChangeCallback(id, newText);
  };

  return (
    <span
      className={cn("span-block", {
        "span-block_highlight": inTime,
        "span-block_attention": confidence <= 0.5,
      })}
      title={`${originalText} (${startTime}-${endTime}) [${confidence}]`}
      contentEditable={true}
      onChange={onInput}
      onClick={() => onClickCallback(id)}
    >
      {text}
    </span>
  );
}

export default TextBlock;
