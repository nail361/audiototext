import { FunctionComponent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RootState } from "../../store";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../store/auth";

import classNames from "classnames/bind";
import styles from "./header.module.scss";
import type { WithTranslation } from "../../types/withTranslation";

const cn = classNames.bind(styles);

const Header: FunctionComponent<WithTranslation> = (props: WithTranslation) => {
  const router = useRouter();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const dispatch = useDispatch();
  const { t } = props;

  const logOut = () => {
    dispatch(authActions.logout());
  };

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
          {!isAuth && (
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
          )}
          {isAuth && (
            <a
              suppressHydrationWarning
              onClick={logOut}
              className={cn("header-nav__link")}
            >
              {t("logout")}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
