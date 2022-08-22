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
    <input
      className={cn("span-block", { "span-block_highlight": inTime })}
      onInput={onInput}
      onClick={() => onClickCallback(id)}
      value={text}
      size={text.length <= 2 ? 2 : (text.length - 2) * 1.15}
    />
  );
}

export default TextBlock;
