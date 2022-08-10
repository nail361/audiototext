import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import Header from "../header/header";
import Footer from "../footer/footer";

import classes from "./layout.module.scss";

type Props = {
  children: React.ReactNode;
};

const protectedPages = ["/profile", "/wallet"];

const Layout: FunctionComponent<Props> = (props) => {
  const { t, i18n } = useTranslation(["common"], {
    bindI18n: "languageChanged loaded",
  });

  useEffect(() => {
    if (i18n) i18n.reloadResources(i18n.resolvedLanguage, ["common"]);
  }, [i18n]);

  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const [protectedPage, setProtectedPage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (protectedPages.includes(router.pathname) && !isAuth) {
      router.replace("./");
    } else {
      setProtectedPage(false);
    }
  }, [isAuth, router]);

  return (
    <div className={classes.layout}>
      <Header t={t} />
      {protectedPage ? null : (
        <main className={classes.wrapper}>{props.children}</main>
      )}
      <Footer t={t} />
    </div>
  );
};

export default Layout;
