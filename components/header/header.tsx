import { FunctionComponent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import classNames from "classnames/bind";
import styles from "./header.module.scss";
import type { WithTranslation } from "../../types/withTranslation";

const cn = classNames.bind(styles);

const Header: FunctionComponent<WithTranslation> = (props: WithTranslation) => {
  const router = useRouter();
  const { t } = props;

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
          <Link href="/auth">
            <a
              suppressHydrationWarning
              className={cn({
                "header-nav__link": true,
                "header-nav__link_active": router.pathname == "/auth",
              })}
            >
              {t("auth")}
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
