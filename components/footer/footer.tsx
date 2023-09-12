import { FunctionComponent } from "react";
import Link from "next/link";
import type { WithTranslation } from "next-i18next";

import classNames from "classnames/bind";
import styles from "./footer.module.scss";

const cn = classNames.bind(styles);

const Footer: FunctionComponent<WithTranslation> = (props: WithTranslation) => {
  const { t } = props;

  return (
    <footer className={cn("footer")}>
      <div className={cn("footer__row")}>
        <div className={cn("footer__row__logo")}>
          <span>аудиорасшифровщик.рф</span>
        </div>
        <div className={cn("footer__row__links")}>
          <Link href={"/#about"}>
            <a suppressHydrationWarning className={cn("footer__link")}>
              {t("about")}
            </a>
          </Link>
          <Link href={"/#instruction"}>
            <a suppressHydrationWarning className={cn("footer__link")}>
              {t("instruction")}
            </a>
          </Link>
          <Link href={"/#price"}>
            <a suppressHydrationWarning className={cn("footer__link")}>
              {t("price")}
            </a>
          </Link>
          <Link href={"/contacts"}>
            <a suppressHydrationWarning className={cn("footer__link")}>
              {t("contacts")}
            </a>
          </Link>
        </div>
      </div>
      <div className={cn("footer__block")}>
        <Link href={"/agreement"}>
          <a suppressHydrationWarning>
            Пользовательское соглашение
          </a>
        </Link>
        <Link href={"/privacy"}>
          <a suppressHydrationWarning>
            Политика конфиденциальности
          </a>
        </Link>
      </div>
      <div className={cn("footer__block")}>
        <span>аудиорасшифровщик.рф © 2023</span>
      </div>
    </footer>
  );
};

export default Footer;
