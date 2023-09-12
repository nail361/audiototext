import React, { FunctionComponent, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Header from "../header/header";
import Footer from "../footer/footer";
//import "../support/support.js";


import classes from "./layout.module.scss";
import ProtectedPages from "../../hoc/protectedPages";

type Props = {
  children: React.ReactNode;
};

const Layout: FunctionComponent<Props> = (props) => {
  const { t, i18n } = useTranslation(["common"], {
    //@ts-ignore
    bindI18n: "languageChanged loaded",
  });

  useEffect(() => {
    if (i18n) i18n.reloadResources(i18n.resolvedLanguage, ["common"]);
  }, [i18n]);

  return (
    <div className={classes.layout}>
      {/* @ts-ignore */}
      <Header t={t} />
      <ProtectedPages>
        <main className={classes.wrapper}>{props.children}</main>
      </ProtectedPages>
      {/* @ts-ignore */}
      <Footer t={t} />
    </div>
  );
};

export default Layout;
