import "../styles/globals.scss";
import "../styles/reset.css";
import type { AppProps } from "next/app";
import { Suspense } from "react";
import Head from "next/head";
import Layout from "../components/layout/layout";
import { appWithTranslation } from "next-i18next";
import nextI18nConfig from "../next-i18next.config";
import store from "../store";
import { Provider } from "react-redux";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Suspense fallback="loading">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Suspense>
    </Provider>
  );
}

export default appWithTranslation(MyApp, nextI18nConfig);
