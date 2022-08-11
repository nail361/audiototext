import type { NextPage } from "next";
import { GetStaticProps } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { RootState } from "../../store";
import { walletActions } from "../../store/wallet";
import { useSelector, useDispatch } from "react-redux";

import classNames from "classnames/bind";
import styles from "./wallet.module.scss";
const cn = classNames.bind(styles);

const Wallet: NextPage = () => {
  const { t } = useTranslation("wallet");
  let costPerMinute = 1.2;
  const [isLoading, setLoading] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [cost, setCost] = useState(0);
  const money = useSelector((state: RootState) => state.wallet.money);
  const dispatch = useDispatch();

  useEffect(() => {
    // fetch();   get costPerMinute
    setMinutes(1);
    setCost(costPerMinute);
    setLoading(false);
  }, [costPerMinute]);

  const addMoney = () => {
    console.log("Add money");
    dispatch(walletActions.add(50));
  };

  const onMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const minuteValue = parseInt(e.target.value);
    setMinutes(minuteValue);
    const costValue = parseFloat((minuteValue * costPerMinute).toFixed(1));
    setCost(costValue);
  };

  const onCostChange = (e: ChangeEvent<HTMLInputElement>) => {
    const costValue = parseFloat(e.target.value);
    setCost(costValue);
    const minuteValue = Math.floor(costValue / costPerMinute);
    setMinutes(minuteValue);
  };

  return (
    <div className={cn("card", "wallet")}>
      <h1>{t("balance")}</h1>
      <p className={cn("wallet__balance")}>
        <strong>{money}</strong> рублей.
      </p>
      <div className={cn("calculator")}>
        {isLoading && <div className={cn("calculator_column")}>Loading...</div>}
        {!isLoading && (
          <>
            <div className={cn("calculator_column")}>
              <label htmlFor="minute">{t("minute")}</label>
              <input
                name="minute"
                type="number"
                value={minutes}
                onChange={onMinutesChange}
              />
            </div>
            <div className={cn("calculator_column")}>=</div>
            <div className={cn("calculator_column")}>
              <label htmlFor="cost">{t("cost")}</label>
              <input
                name="cost"
                type="number"
                min={costPerMinute}
                step={0.1}
                value={cost}
                onChange={onCostChange}
              />
            </div>
          </>
        )}
      </div>
      <div className={cn("payments")}>
        <div className={cn("payments__icon", "payments__icon_mc")}></div>
        <div className={cn("payments__icon", "payments__icon_visa")}></div>
        <div className={cn("payments__icon", "payments__icon_mir")}></div>
      </div>
      <button className={cn("btn", { disabled: isLoading })} onClick={addMoney}>
        {t("add")}
      </button>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["wallet"])),
    },
    revalidate: 10,
  };
};

export default Wallet;
