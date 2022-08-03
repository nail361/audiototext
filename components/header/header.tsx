import { FunctionComponent } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import classNames from "classnames/bind";
import styles from "./header.module.scss";

const cn = classNames.bind(styles);

const Header: FunctionComponent = () => {
  const { t, ready } = useTranslation("header");
  const router = useRouter();

  if (!ready) return "loading translations...";

  return (
    <header className={cn("header")}>
      <div className={cn("header-row")}>
        <div className={cn("header-row__logo")}>Аудиорасшифровщик.рф</div>
        <nav className={cn("header-nav")}>
          <Link href="/">
            <a
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
