import { FunctionComponent } from "react";
import Link from "next/link";
import type { WithTranslation } from "../../types/withTranslation";

import classNames from "classnames/bind";
import styles from "./footer.module.scss";

const cn = classNames.bind(styles);

const Footer: FunctionComponent<WithTranslation> = (props: WithTranslation) => {
  const { t } = props;

  return (
    <footer className={cn("footer")}>
      <span>аудиорасшифровщик.рф © 2021</span>
      <Link href="/contacts">
        <a suppressHydrationWarning className={cn("footer__link")}>
          {t("contacts")}
        </a>
      </Link>
    </footer>
  );
};

export default Footer;
