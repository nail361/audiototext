import type { NextPage, GetStaticProps } from "next";
import { FormEvent, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { authActions } from "../../store/auth";

import classNames from "classnames/bind";
import styles from "./auth.module.scss";

const cn = classNames.bind(styles);

const Auth: NextPage = () => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const [authType, setAuthType] = useState("login"); //login or register
  const [rulesWindow, setRulesWindow] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const isLogin = authType == "login";
  const dispath = useDispatch();

  const name = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const pass = useRef<HTMLInputElement>(null);
  const checkbox = useRef<HTMLInputElement>(null);

  const checkRegisterBtn = () => {
    let flag = true;

    if (name.current!.value.length < 3) flag = false;
    if (!email.current!.value.match(/.(.*)+@.(.*)+\..(.*)/)) flag = false;
    if (pass.current!.value.length < 6) flag = false;
    if (!checkbox.current!.checked) flag = false;

    setCanRegister(flag);
  };

  const goToRegister = () => {
    setAuthType("register");
  };

  const goToLogin = () => {
    setAuthType("login");
  };

  const sendData = (event: FormEvent) => {
    event.preventDefault();

    if (isLogin) {
      dispath(authActions.login("token"));
      router.push("/profile");
    } else {
      if (!canRegister) return;
    }

    console.log("send data");

    // fetch("");
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
            <input
              id="name"
              type="text"
              ref={name}
              onChange={checkRegisterBtn}
            />
          </div>
        )}
        <div className={cn("form__item")}>
          <label htmlFor="email">{t("email")}:</label>
          <input
            id="email"
            type="email"
            ref={email}
            onChange={checkRegisterBtn}
          />
        </div>
        <div className={cn("form__item")}>
          <label htmlFor="password">{t("password")}:</label>
          <input
            id="password"
            type="password"
            ref={pass}
            onChange={checkRegisterBtn}
          />
        </div>
        {!isLogin && (
          <div className={cn("form__item", "form__item_rules")}>
            <input
              className={cn("checkbox")}
              type="checkbox"
              name="rules"
              id="rules"
              ref={checkbox}
              onChange={checkRegisterBtn}
            />
            <span>
              {t("licence.left_part")}
              <span className={cn("rules")} onClick={showRules}>
                {t("licence.right_part")}
              </span>
            </span>
          </div>
        )}
        <div className={cn("form__item")}>
          <button
            type="submit"
            className={cn("form__submit", {
              form__submit_disabled: !(isLogin || canRegister),
            })}
          >
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
