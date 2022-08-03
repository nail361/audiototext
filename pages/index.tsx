import type { NextPage } from "next";
import { useEffect } from "react";
import Image from "next/image";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cn = classNames.bind(styles);

const Welcome: NextPage = () => {
  // const { t, i18n } = useTranslation("welcome-page", {
  //   bindI18n: "languageChanged loaded",
  // });

  // useEffect(() => {
  //   i18n.reloadResources(i18n.resolvedLanguage, "welcome-page");
  // }, []);

  const { t } = useTranslation("welcome-page");

  return (
    <div className={cn("row")}>
      <div className={cn({ column: true, column_left: true })}>
        <h1>{t("mainTitle")}</h1>
      </div>
      <div className={cn({ column: true, column_right: true })}>
        <div className={cn("column_right__image")}>
          <Image
            src="/images/mainPage.png"
            alt="Picture of the app"
            width={500}
            height={500}
            sizes="50vw"
            priority={true}
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["welcome-page"])),
    },
    revalidate: 10,
  };
};

export default Welcome;
