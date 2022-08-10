import { FunctionComponent, useEffect, useState } from "react";
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
  const [showChild, setShowChild] = useState(false); //fix for react 18
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const money = useSelector((state: RootState) => state.wallet.money);
  const dispatch = useDispatch();
  const { t } = props;

  useEffect(() => {
    setShowChild(true);
  }, []);

  const logOut = () => {
    dispatch(authActions.logout());
  };

  if (!showChild) {
    return null;
  }

  if (typeof window === "undefined") return <></>;

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
          {!isAuth && (
            <Link href="/auth">
              <a
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
            <>
              <Link href="/profile">
                <a
                  className={cn({
                    "header-nav__link": true,
                    "header-nav__link_active": router.pathname == "/profile",
                  })}
                >
                  {t("profile")}
                </a>
              </Link>
              <Link href="/wallet">
                <a
                  className={cn({
                    "header-nav__link": true,
                    "header-nav__link_wallet": true,
                    "header-nav__link_active": router.pathname == "/wallet",
                  })}
                >
                  {money} р.
                </a>
              </Link>
              <a
                onClick={logOut}
                className={cn("header-nav__link", "header-nav__link_logout")}
              >
                {t("logout")}
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
