import React from "react";

import Image from "next/image";
import classNames from "classnames/bind";
import styles from "./mainBtn.module.scss";

const cn = classNames.bind(styles);

type MainBtnType = {
  text: string;
  icon?: any;
  class?: string;
  onClickCallback?: () => void;
};

function MainBtn(props: MainBtnType) {
  const propClass = props.class ? `main-button_${props.class}` : "";

  return (
    <div
      className={cn("main-button", propClass)}
      onClick={() => {
        props.onClickCallback ? props.onClickCallback() : null;
      }}
    >
      {props.icon && (
        <span className={cn("main-button__icon")}>
          <Image src={props.icon} alt={props.text} width={25} height={25} />
        </span>
      )}
      <span className={cn("text")}>{props.text}</span>
    </div>
  );
}

export default MainBtn;
