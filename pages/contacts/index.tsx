import type { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import classNames from "classnames/bind";
import styles from "./contacts.module.scss";

const cn = classNames.bind(styles);

const Contacts: NextPage = () => {
  const { t } = useTranslation("contacts");

  return (
    <div className={cn("card", "contacts")}>
      <div className={cn("fields")}>
        <p>
          <strong>{t("email")}:</strong> shubinm.ip@gmail.com
        </p>
        <br/>
        <p>
          <strong>{t("itn")}:</strong> 711613514228
        </p>
        <p>
          <strong>{t("psrnsp")}:</strong> 321710000072771
        </p>
        <p>
          <strong>{t("sp")}:</strong> ИП Шубин Мирослав Александрович
        </p>
        <br/>
        <p>
          <strong>{t("support_title")}:</strong> <a href="https://t.me/audiototext">https://t.me/audiototext</a>
        </p>
      </div>
      <div className={cn("messengers")}>
        <a
          href="https://t.me/audiototext_admin"
          title={t("telega-developer")}
          target="_blank"
          rel="noreferrer"
          className={cn("messengers__icon", "messengers__icon_telegram")}
        ></a>
      </div>
    </div>
  );
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
