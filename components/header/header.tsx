import { FunctionComponent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import MainBtn from "../mainBtn/mainBtn";

import classNames from "classnames/bind";
import styles from "./header.module.scss";
import type { WithTranslation } from "next-i18next";

const cn = classNames.bind(styles);

const Header: FunctionComponent<WithTranslation> = (props: WithTranslation) => {
  const router = useRouter();
  const [showChild, setShowChild] = useState(false); //fix for react 18
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const money = useSelector((state: RootState) => state.wallet.money);
  const [menu, setMenu] = useState(false);
  const { t } = props;

  useEffect(() => {
    setShowChild(true);
  }, []);

  useEffect(() => {
    setMenu(false);
  }, [router]);

  const toggleMenu = () => {
    setMenu((prevState) => !prevState);
  };

  if (!showChild) {
    return null;
  }

  if (typeof window === "undefined") return <></>;

  return (
    <header className={cn("header")}>
      <div className={cn("header-column")}>
        <div className={cn("header-column__logo")}>аудиорасшифровщик.рф</div>
        <div
          className={cn("header__burger", { header__burger_active: menu })}
          onClick={toggleMenu}
        >
          <span />
        </div>
        <nav className={cn("header__nav", { header__nav_active: menu })}>
          <Link href={"/#about"}>
            <a suppressHydrationWarning className={cn("header__link")}>
              {t("about")}
            </a>
          </Link>
          <Link href={"/#instruction"}>
            <a suppressHydrationWarning className={cn("header__link")}>
              {t("instruction")}
            </a>
          </Link>
          <Link href={"/#price"}>
            <a suppressHydrationWarning className={cn("header__link")}>
              {t("price")}
            </a>
          </Link>
          <Link href={"/contacts"}>
            <a suppressHydrationWarning className={cn("header__link")}>
              {t("contacts")}
            </a>
          </Link>
          {!isAuth && (
            <div className={cn("auth_block")}>
              <Link href="/auth">
                <a
                  className={cn({
                    header__link: true,
                    header__link_active: router.pathname == "/auth",
                  })}
                >
                  {t("register")}
                </a>
              </Link>
              <Link href="/auth">
                <a
                  className={cn({
                    header__link: true,
                  })}
                >
                  <MainBtn text={t("auth")} class="login" />
                </a>
              </Link>
            </div>
          )}
          {isAuth && (
            <div className={cn("auth_block")}>
              <Link href="/audio">
                <a
                  className={cn({
                    header__link: true,
                    header__link_active: router.pathname == "/audio",
                  })}
                >
                  {t("audio")}
                </a>
              </Link>
              <Link href="/profile">
                <a
                  className={cn({
                    header__link: true,
                    header__link_active: router.pathname == "/profile",
                  })}
                >
                  {t("profile")}
                </a>
              </Link>
              <Link href="/wallet">
                <a
                  className={cn({
                    header__link: true,
                    header__link_wallet: true,
                    header__link_active: router.pathname == "/wallet",
                  })}
                >
                  {money} р.
                </a>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
