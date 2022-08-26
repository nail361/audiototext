import React, { useState } from "react";
import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../store/auth";
import { RootState } from "../../store";
import Loader from "../../components/loader";

import classNames from "classnames/bind";
import styles from "./profile.module.scss";

const cn = classNames.bind(styles);

const Profile: NextPage = () => {
  const { t } = useTranslation(["profile"]);
  const [loading, setLoading] = useState(false);
  const email = useSelector((state: RootState) => state.auth.email);
  const dispatch = useDispatch();

  const logOut = () => {
    dispatch(authActions.logout());
  };

  const onSave = () => {
    setLoading(true);
    //send data to server fetch
  };

  return (
    <div className={cn("card", "profile")}>
      {loading && <Loader height="100px" />}
      <div className={cn("fields")}>
        <label htmlFor="email">{t("email")}</label>
        <input type="email" name="email" id="email" value={email} />
        <label htmlFor="pass1">{t("newPassword")}</label>
        <input type="password" name="pass1" id="pass1" />
        <label htmlFor="pass2">{t("newPassOneMoreTime")}</label>
        <input type="password" name="pass2" id="pass2" />
      </div>
      <button onClick={onSave} className={cn("btn", "profile__save")}>
        {t("save")}
      </button>
      <button onClick={logOut} className={cn("btn", "profile__logout")}>
        {t("logout")}
      </button>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["profile"])),
    },
    revalidate: 10,
  };
};

export default Profile;
