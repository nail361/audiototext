import type { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import classNames from "classnames/bind";
import styles from "./contacts.module.scss";

const cn = classNames.bind(styles);

const Contacts: NextPage = () => {
  const { t } = useTranslation("contacts");

  return <div className={cn("contacts")}>yliza phone</div>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["contacts"])),
    },
    revalidate: 10,
  };
};

export default Contacts;
