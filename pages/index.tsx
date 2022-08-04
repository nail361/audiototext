import type { NextPage } from "next";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cn = classNames.bind(styles);

const Welcome: NextPage = () => {
  const { t, i18n, ready } = useTranslation("welcome-page");
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const router = useRouter();

  const featuresArr = [];
  featuresArr.length = 6;

  for (let i = 0; i < featuresArr.length; i++) {
    featuresArr[i] = (
      <div className={cn("item")}>
        <div className={cn("item__image")}>
          <Image
            src={`/images/features/${i + 1}.png`}
            alt="feature image"
            width={50}
            height={50}
            objectFit="contain"
          />
        </div>
        <div className={cn("item__description")}>
          <h1>{t(`features.${i}.title`)}</h1>
          <p>{t(`features.${i}.description`)}</p>
        </div>
      </div>
    );
  }

  console.log(ready);

  console.log(featuresArr);

  const onStartClickHandler = () => {
    if (isAuth) router.push("/local-storage");
    else router.push("/auth");
  };

  return (
    <>
      <div className={cn("row")}>
        <div className={cn({ column: true, column_left: true })}>
          <h1 className={cn("column__title")}>{t("mainTitle.line1")}</h1>
          <h1 className={cn("column__title")}>{t("mainTitle.line2")}</h1>
          <h1 className={cn("column__title")}>{t("mainTitle.line3")}</h1>
          <p className={cn("column__description")}>{t("description")}</p>
          <ul className={cn("column__ul")}>
            <li className={cn("column__li")}>{t("list.li1")}</li>
            <li className={cn("column__li")}>{t("list.li2")}</li>
            <li className={cn("column__li")}>{t("list.li3")}</li>
          </ul>
          <button
            className={cn("column__start_btn")}
            onClick={onStartClickHandler}
          >
            {t("startBtn")}
          </button>
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
      <div className={cn("grid")}>{featuresArr}</div>
    </>
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
