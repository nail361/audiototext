import "../styles/globals.scss";
import "../styles/reset.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Suspense, useEffect, useState } from "react";
import Head from "next/head";
import Layout from "../components/layout/layout";
import { Toaster } from "react-hot-toast";
import { appWithTranslation } from "next-i18next";
import nextI18nConfig from "../next-i18next.config";
import store from "../store";
import { Provider } from "react-redux";
import Loader from "../components/loader";

function Loading() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && setLoading(true);
    const handleComplete = (url: string) =>
      url === router.asPath && setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });

  if (loading) return <Loader height="100px" top={"40%"} />;
  else return null;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Head>
        <title>SpeechToText</title>
        <meta name="author" content="nail361 and shubin"></meta>
        <meta name="description" content="Распознавание голоса в текст"></meta>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Suspense fallback="loading">
        <Layout>
          <Loading />
          <Toaster />
          <Component {...pageProps} />
        </Layout>
      </Suspense>
    </Provider>
  );
}
//@ts-ignore
export default appWithTranslation(MyApp, nextI18nConfig);
