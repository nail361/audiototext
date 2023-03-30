import type { NextPage, GetStaticProps } from "next";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import MainBtn from "../components/mainBtn/mainBtn";

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
      <div key={i} className={cn("card", "features-block__feature")}>
        <div className={cn("features-block__description")}>
          <h1>{t(`features.${i}.title`)}</h1>
          <p>{t(`features.${i}.description`)}</p>
        </div>
      </div>
    );
  }

  const exportArr = [];
  exportArr.length = 3;

  for (let i = 0; i < exportArr.length; i++) {
    exportArr[i] = (
      <div key={i} className={cn("item")}>
        <h1>{t(`exportBlock.rows.${i}.title`)}</h1>
        <p>{t(`exportBlock.rows.${i}.description`)}</p>
      </div>
    );
  }

  const instructionArr = [];
  instructionArr.length = 3;

  for (let i = 0; i < instructionArr.length; i++) {
    instructionArr[i] = (
      <div key={i} className={cn("item")}>
        <div className={cn("card", "icon")}>{i + 1}</div>
        <p>{t(`instructionBlock.rows.${i}`)}</p>
      </div>
    );
  }

  const onStartClickHandler = () => {
    if (isAuth) router.push("/audio");
    else router.push("/auth");
  };

  return (
    <>
      <div className={cn("first-block")}>
        <div className={cn("first-block__column", "first-block__column_left")}>
          <h1 className={cn("first-block__column__title")}>
            {t("mainTitle.line1")}
          </h1>
          <h1 className={cn("first-block__column__title")}>
            {t("mainTitle.line2")}
          </h1>
          <h1 className={cn("first-block__column__title")}>
            {t("mainTitle.line3")}
          </h1>
          <p className={cn("first-block__column__description")}>
            {t("description")}
          </p>
          <MainBtn
            text={t("startBtn")}
            class="start"
            icon="/icons/btn/fire.png"
            onClickCallback={onStartClickHandler}
          />
        </div>
        <div className={cn("first-block__column", "first-block__column_right")}>
          <div className={cn("column_right__image")}>
            <Image
              src="/images/mainPage.png"
              alt="Picture of the app"
              width={973}
              height={800}
              sizes="50vw"
              priority={true}
              objectFit="contain"
            />
          </div>
        </div>
      </div>
      <div id="about" />
      <div className={cn("statistic-block")}>
        <div className={cn("statistic-block__item")}>
          &#62; 500 пользователей
        </div>
        <div className={cn("statistic-block__item")}>
          2500 часов расшифровано
        </div>
        <div className={cn("statistic-block__item")}>132 файла загружено</div>
      </div>
      <div className={cn("features-block")}>
        {featuresArr}
        <div className={cn("features-block__lights")}>
          <div
            className={cn(
              "features-block__lights__light",
              "features-block__lights__light_left"
            )}
          >
            <Image
              src="/images/bg_lights/light_left.png"
              alt="light"
              layout="fill"
            />
          </div>
          <div
            className={cn(
              "features-block__lights__light",
              "features-block__lights__light_middle"
            )}
          >
            <Image
              src="/images/bg_lights/light_middle.png"
              alt="light"
              layout="fill"
            />
          </div>
          <div
            className={cn(
              "features-block__lights__light",
              "features-block__lights__light_right-top"
            )}
          >
            <Image
              src="/images/bg_lights/light_right_top.png"
              alt="light"
              layout="fill"
            />
          </div>
          <div
            className={cn(
              "features-block__lights__light",
              "features-block__lights__light_right-bottom"
            )}
          >
            <Image
              src="/images/bg_lights/light_right_bottom.png"
              alt="light"
              layout="fill"
            />
          </div>
        </div>
      </div>
      <div className={cn("export-block")}>
        <div
          className={cn("export-block__column", "export-block__column_left")}
        >
          <div className={cn("image-wrapper")}>
            <Image
              src="/images/exportImg.png"
              alt="export"
              width={500}
              height={500}
              sizes="50vw"
              priority={true}
              objectFit="contain"
            />
          </div>
        </div>
        <div id="instruction" />
        <div
          className={cn("export-block__column", "export-block__column_right")}
        >
          <div className={cn("column")}>
            <h1>{t(`exportBlock.export`)}</h1>
            <p>{t(`exportBlock.description`)}</p>
          </div>
          <div className={cn("row")}>{exportArr}</div>
        </div>
      </div>
      <div className={cn("instruction-block")}>
        <div className={cn("instruction-block__title")}>
          {t("instructionBlock.howItWorks")}
        </div>
        <div className={cn("instruction-block__row")}>{instructionArr}</div>
        <div>
          <MainBtn
            text={t("instructionBlock.uploadBtn")}
            icon="/icons/btn/fire.png"
            class="upload"
            onClickCallback={onStartClickHandler}
          />
        </div>
      </div>
      <div className={cn("price-block")}>
        <div className={cn("price-block__left-side")}>
          <h1>{t("priceBlock.howMuch")}</h1>
          <p className={cn("price-block__price")}>{t("priceBlock.price")}</p>
          <p className={cn("price-block__info")}>{t("priceBlock.seconds")}</p>
          <MainBtn
            text={t("priceBlock.startBtn")}
            icon="/icons/btn/fire.png"
            class="start-use"
            onClickCallback={onStartClickHandler}
          />
        </div>
        <div className={cn("price-block__right-side")} id="price">
          <div className={cn("card", "price-block__description")}>
            {t("priceBlock.offer")}
          </div>
          <div className={cn("price-block__image")}>
            <Image
              src="/images/priceImg.png"
              alt="export"
              width={500}
              height={500}
              sizes="50vw"
              priority={true}
              objectFit="contain"
            />
          </div>
        </div>
      </div>
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
