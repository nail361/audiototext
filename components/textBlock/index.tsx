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

  const onInput = (event: SyntheticEvent<HTMLInputElement>) => {
    let newText = event.currentTarget.value;
    onChangeCallback(id, newText);
  };

  return (
    <input
      className={cn("span-block", {
        "span-block_highlight": inTime,
        "span-block_attention": confidence <= 0.5,
      })}
      style={{ width: `${text.length + 1}ch` }}
      title={`${originalText} (${startTime}-${endTime}) [${confidence}]`}
      onInput={onInput}
      onClick={() => onClickCallback(id)}
      value={text}
    />
  );
}

function memoEqual(prevProps: textBlockType, nextProps: textBlockType) {
  return (
    prevProps.text === nextProps.text && prevProps.inTime === nextProps.inTime
  );
}

export default React.memo(TextBlock, memoEqual);
