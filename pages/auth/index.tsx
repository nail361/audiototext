import type { NextPage } from "next";
import { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import classNames from "classnames/bind";
import styles from "./auth.module.scss";

const cn = classNames.bind(styles);

const Auth: NextPage = () => {
  const { t } = useTranslation("auth");
  const [authType, setAuthType] = useState("login"); //login or register
  const [rulesWindow, setRulesWindow] = useState(false);
  const isLogin = authType == "login";

  const goToRegister = () => {
    setAuthType("register");
  };

  const goToLogin = () => {
    setAuthType("login");
  };

  const sendData = () => {
    console.log(isLogin);
  };

  const showRules = () => {
    setRulesWindow(true);
  };

  return (
    <div className={cn("auth_card")}>
      <h1 className={cn("auth_card__header")}>
        {t("title", { context: authType })}
      </h1>
      <form onSubmit={sendData} className={cn("form")}>
        {!isLogin && (
          <div className={cn("form__item")}>
            <label htmlFor="name">{t("name")}:</label>
            <input id="name" type="text" />
          </div>
        )}
        <div className={cn("form__item")}>
          <label htmlFor="email">{t("email")}:</label>
          <input id="email" type="email" />
        </div>
        <div className={cn("form__item")}>
          <label htmlFor="password">{t("password")}:</label>
          <input id="password" type="password" />
        </div>
        {!isLogin && (
          <div className={cn("form__item", "form__item_rules")}>
            <input
              className={cn("rules")}
              type="checkbox"
              name="rules"
              id="rules"
            />
            <span>
              soglasen s <span onClick={showRules}>pravila</span>
            </span>
          </div>
        )}
        <div className={cn("form__item")}>
          <button type="submit" className={cn("form__submit")}>
            {isLogin ? t("login-btn") : t("register-btn")}
          </button>
        </div>
      </form>
      <div className={cn("footer")}>
        <p
          className={cn("auth_card__register")}
          onClick={() => {
            isLogin ? goToRegister() : goToLogin();
          }}
        >
          {isLogin ? t("register") : t("login")}
        </p>
      </div>
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
