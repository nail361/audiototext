import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import classNames from "classnames/bind";
import styles from "./profile.module.scss";

const cn = classNames.bind(styles);

const Profile: NextPage = () => {
  const { t } = useTranslation("profile");

  return <div>PROFILE</div>;
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
