import { FunctionComponent } from "react";
import Link from "next/link";
import type { WithTranslation } from "next-i18next";

import classNames from "classnames/bind";
import styles from "../footer/footer.module.scss";

const cn = classNames.bind(styles);

const Support: FunctionComponent<WithTranslation> = (props: WithTranslation) => {
  const { t } = props;

  return (
      <div className={cn("footer")}>
          <div className={cn("footer__row")}>
              <div className={cn("footer__row__logo")}>
                  <span>аудиорасшифровщик.рф</span>
              </div>
          </div>
          <script>

          </script>
      </div>
  );
};

export default Support;
