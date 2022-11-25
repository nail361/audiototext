import React, { SyntheticEvent, useEffect, useState } from "react";

import { textData } from "../../types/textData";

import classNames from "classnames/bind";
import styles from "./textBlock.module.scss";

const cn = classNames.bind(styles);

type textBlockType = textData & {
  inTime: boolean;
  onClickCallback: (id: string) => void;
  onChangeCallback: (id: string, text: string) => void;
  createNewTextBlocks: (id: string, words: string[]) => void;
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
    createNewTextBlocks,
  } = props;

  const onInput = (event: SyntheticEvent<HTMLInputElement>) => {
    let newText = event.currentTarget.value;

    if (newText.indexOf(" ") >= 0) {
      const words: string[] = newText.split(" ");
      newText = words[0];
      createNewTextBlocks(id, words.slice(1));
    }

    onChangeCallback(id, newText);
  };

  const onPaste = (event) => {
    console.log(event);
  };

  const onCut = (event) => {
    console.log(event);
  };

  return (
    <input
      className={cn("span-block", {
        "span-block_highlight": inTime,
        "span-block_attention": confidence <= 0.5,
      })}
      style={{ width: `${text.length + 1}ch` }}
      title={`${originalText} (${startTime}-${endTime}) [${confidence}] ${id}`}
      onInput={onInput}
      onClick={() => onClickCallback(id)}
      onPaste={onPaste}
      onCut={onCut}
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
