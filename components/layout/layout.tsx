import React, { FunctionComponent, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Header from "../header/header";
import Footer from "../footer/footer";

import classes from "./layout.module.scss";

type Props = {
  children: React.ReactNode;
};

const Layout: FunctionComponent<Props> = (props) => {
  const { t, i18n } = useTranslation(["common"], {
    bindI18n: "languageChanged loaded",
  });

  useEffect(() => {
    if (i18n) i18n.reloadResources(i18n.resolvedLanguage, ["common"]);
  }, [i18n]);

  return (
    <div className={classes.layout}>
      <Header t={t} />
      <main className={classes.wrapper}>{props.children}</main>
      <Footer t={t} />
    </div>
  );
};

export default Layout;
