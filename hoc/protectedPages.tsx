import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RootState } from "../store";
import { useSelector } from "react-redux";

type Props = {
  children: React.ReactNode;
};

const protectedPages = ["/profile", "/wallet", "/edit/[id]"];

function ProtectedPages(props: Props) {
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  const [protectedPage, setProtectedPage] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuth && protectedPages.includes(router.route)) {
      router.replace("/");
    } else {
      setProtectedPage(false);
    }
  }, [isAuth, router]);

  if (protectedPage) return null;

  return <>{props.children}</>;
}

export default ProtectedPages;
