import { FunctionComponent, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import classNames from "classnames/bind";
import styles from "./header.module.scss";

const cn = classNames.bind(styles);

const Header: FunctionComponent = () => {
  const router = useRouter();

  const { t, i18n } = useTranslation(["header"], {
    bindI18n: "languageChanged loaded",
  });

  useEffect(() => {
    i18n.reloadResources(i18n.resolvedLanguage, ["header"]);
  }, [i18n]);

  return (
    <header className={cn("header")}>
      <div className={cn("header-row")}>
        <div className={cn("header-row__logo")}>Аудиорасшифровщик.рф</div>
        <nav className={cn("header-nav")}>
          <Link href="/">
            <a
              suppressHydrationWarning
              className={cn({
                "header-nav__link": true,
                "header-nav__link_active": router.pathname == "/",
              })}
            >
              {t("main")}
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
