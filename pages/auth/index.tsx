import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import classNames from "classnames/bind";
import styles from "./auth.module.scss";

const cn = classNames.bind(styles);

const Auth: NextPage = () => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const [authType, setAuthType] = useState("login"); //login or register
  const isLogin = authType == "login";

  const goToRegister = () => {
    setAuthType("register");
  };

  return (
    <div className={cn("auth_card")}>
      <h1 className={cn("auth_card__header")}>
        {t("title", { context: authType })}
      </h1>
      {isLogin && (
        <p className={cn("auth_card__register")} onClick={goToRegister}>
          {t("register")}
        </p>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["auth"])),
    },
    revalidate: 10,
  };
};

export default Auth;
