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
        <a href="https://">Политика конфиденциальности</a>
        <a href="https://">Пользовательское соглашение</a>
      </div>
      <div className={cn("footer__block")}>
        <span>аудиорасшифровщик.рф © 2021</span>
      </div>
    </footer>
  );
};

export default Footer;
