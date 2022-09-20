import type { NextPage, GetStaticProps } from "next";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { authActions } from "../../store/auth";
import { walletActions } from "../../store/wallet";
import useAPI from "../../hooks/use-api";
import toast from "react-hot-toast";

import classNames from "classnames/bind";
import styles from "./auth.module.scss";

const cn = classNames.bind(styles);

const authTypes = { LOGIN: "login", REGISTER: "register" };

const Auth: NextPage = () => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const [authType, setAuthType] = useState(authTypes.LOGIN);
  const [disabledSubmitBtn, setDisabledSubmitBtn] = useState(true);
  const isLogin = authType == authTypes.LOGIN;
  const dispath = useDispatch();

  const name = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const pass = useRef<HTMLInputElement>(null);
  const checkbox = useRef<HTMLInputElement>(null);

  const { isLoading, sendRequest } = useAPI();

  const checkSubmitBtn = useCallback(() => {
    let flag = false;

    if (authType == authTypes.REGISTER) {
      if (name.current!.value.length < 3) flag = true;
      if (!checkbox.current!.checked) flag = true;
    }

    if (!email.current!.value.match(/.(.*)+@.(.*)+\..(.*)/)) flag = true;
    if (pass.current!.value.length < 6) flag = true;
    setDisabledSubmitBtn(flag);
  }, [authType]);

  useEffect(() => {
    checkSubmitBtn();
  }, [checkSubmitBtn, authType]);

  const goToRegister = () => {
    setAuthType(authTypes.REGISTER);
  };

  const goToLogin = () => {
    setAuthType(authTypes.LOGIN);
  };

  const sendData = (event: FormEvent) => {
    event.preventDefault();
    if (disabledSubmitBtn) return;

    if (isLogin) {
      sendRequest(
        {
          url: `auth?
                email=${email.current!.value}
                &password=${pass.current!.value}`,
          method: "GET",
        },
        onAuthSuccess,
        onAuthError
      );
    } else {
      const formData = new FormData();
      formData.append("email", email.current!.value);
      formData.append("password", pass.current!.value);
      formData.append("name", name.current!.value);

      sendRequest(
        {
          url: "register",
          body: formData,
        },
        onRegisterSuccess,
        onRegisterError
      );
    }
  };

  const onRegisterSuccess = () => {
    goToLogin();
    toast.success(t("registerSuccess"), { duration: 5000 });
  };

  const onRegisterError = (error: { email?: string[] }) => {
    if (error.email) {
      toast.error(error.email.join(" "));
    }
  };

  const onAuthSuccess = (data: {
    status: string;
    token: string;
    money: number;
  }) => {
    dispath(
      authActions.login({ token: data.token, email: email.current?.value })
    );
    dispath(walletActions.update(data.money));
    router.push("/audio");
  };

  const onAuthError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className={cn("card", "auth-card")}>
      <h1 className={cn("auth-card__header")}>
        {t("title", { context: authType })}
      </h1>
      <form onSubmit={sendData} className={cn("form")}>
        {!isLogin && (
          <div className={cn("form__item")}>
            <label htmlFor="name">{t("name")}:</label>
            <input id="name" type="text" ref={name} onChange={checkSubmitBtn} />
          </div>
        )}
        <div className={cn("form__item")}>
          <label htmlFor="email">{t("email")}:</label>
          <input
            id="email"
            type="email"
            ref={email}
            onChange={checkSubmitBtn}
          />
        </div>
        <div className={cn("form__item")}>
          <label htmlFor="password">{t("password")}:</label>
          <input
            id="password"
            type="password"
            ref={pass}
            onChange={checkSubmitBtn}
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
              onChange={checkSubmitBtn}
            />
            <span>
              {t("licence.left_part")}
              <a
                href="https://www.google.com"
                rel="noreferrer"
                className={cn("rules")}
                target="_blank"
              >
                {t("licence.right_part")}
              </a>
            </span>
          </div>
        )}
        <div className={cn("form__item")}>
          <button
            type="submit"
            className={cn("btn", {
              disabled: disabledSubmitBtn || isLoading,
            })}
          >
            {isLogin ? t("login-btn") : t("register-btn")}
          </button>
        </div>
      </form>
      <div className={cn("footer")}>
        <p
          className={cn("auth-card__register")}
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
