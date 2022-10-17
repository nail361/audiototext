import React, { SyntheticEvent, useEffect, useState } from "react";

import { textData } from "../../types/textData";

import classNames from "classnames/bind";
import styles from "./textBlock.module.scss";

const cn = classNames.bind(styles);

type textBlockType = textData & {
  curTime: number;
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
    curTime,
    onClickCallback,
    onChangeCallback,
  } = props;
  const [inTime, setInTime] = useState(false);

  useEffect(() => {
    setInTime(startTime <= curTime && endTime > curTime);
  }, [startTime, endTime, curTime]);

  const onInput = (event: SyntheticEvent<HTMLInputElement>) => {
    let newText = event.currentTarget.value;
    onChangeCallback(id, newText);
  };

  return (
    <span
      className={cn("span-block", {
        "span-block_highlight": inTime,
        "span-block_attention": confidence <= 0.5,
      })}
      onInput={onInput}
      onClick={() => onClickCallback(id)}
    >
      {text}
    </span>
  );
}

export default TextBlock;
