import "../styles/globals.scss";
import "../styles/reset.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "../components/layout/layout";
import { appWithTranslation } from "next-i18next";
import nextI18nConfig from "../next-i18next.config";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default appWithTranslation(MyApp, nextI18nConfig);
