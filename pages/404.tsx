import { FunctionComponent, useEffect } from "react";
import { useRouter } from "next/router";
import { withTranslation } from "next-i18next";

const Custom404: FunctionComponent = ({ t }) => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.replace("/"), 1000);
  }, [router]);

  return <div suppressHydrationWarning>{t("redirect")}</div>;
};

export default withTranslation("404")(Custom404);
