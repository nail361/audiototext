import React from "react";

import classNames from "classnames/bind";
import styles from "./loader.module.scss";

const cn = classNames.bind(styles);

type LoaderType = {
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  overlay?: boolean;
};

function Loader({ width, height, top, left, overlay = true }: LoaderType) {
  return (
    <>
      {overlay && <div className={cn("overlay")} />}
      <div className={cn("loader")} style={{ width, height, top, left }}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  );
}

export default Loader;
