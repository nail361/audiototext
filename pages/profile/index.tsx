import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Image from "next/image";

import classNames from "classnames/bind";
import styles from "./profile.module.scss";
import { ChangeEvent, useEffect, useState } from "react";
import Audio from "../../models/audio";

const cn = classNames.bind(styles);

const Profile: NextPage = () => {
  const { t } = useTranslation("profile");
  const [filesCount, setFilesCount] = useState(0);
  const [audio, setAudio] = useState<Audio[]>([]);
  const [isUpload, setUpload] = useState(false);
  let audioList = null;

  useEffect(() => {
    getAudio();
  }, []);

  const getAudio = () => {
    //fetch  - взять данные с сервера

    setAudio([
      {
        id: "1",
        date: "12.30.2022",
        name: "audio1",
        duration: "01:33",
        cost: "50rub",
      },
    ]);
  };

  const readFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (isUpload) return;

    const files = e.target!.files;
    if (!files) {
      return;
    }

    setFilesCount(files.length);
    sendAudioToServer(files);
  };

  const sendAudioToServer = (files: FileList) => {
    setUpload(true);

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("audio[]", files[i]);
    }

    //fetch('', {method: "POST", body: formData});

    // setUpload(false);
  };

  if (audio.length) {
    audioList = (
      <table>
        <caption>{t("table.caption")}</caption>
        <thead>
          <tr>
            <td>{t("table.date")}</td>
            <td>{t("table.name")}</td>
            <td>{t("table.duration")}</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {audio.map((audio) => (
            <tr key={audio.id}>
              <td>{audio.date}</td>
              <td>{audio.name}</td>
              <td>{audio.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    audioList = <span>{t("no_audio")}</span>;
  }

  return (
    <>
      <div className={cn("file_uploader")}>
        <input
          name="file-uploader"
          id="file-uploader"
          multiple
          type="file"
          accept="audio/*"
          className={cn("file_uploader__input")}
          onChange={readFiles}
        />
        <label
          htmlFor="file-uploader"
          className={cn("file_uploader__btn", {
            file_uploader__btn_disabled: isUpload,
          })}
        >
          <span className={cn("icon_wrapper")}>
            <Image
              className={cn("icon_wrapper__icon", {
                icon_wrapper__icon_spin: isUpload,
              })}
              src={isUpload ? "/icons/loading.png" : "/icons/upload.png"}
              alt="Выбрать файл"
              width={25}
              height={25}
              objectFit="contain"
            />
          </span>
          <span>
            {filesCount
              ? `${t("choosen_audio")} ${filesCount}`
              : t("choose_audio")}
          </span>
        </label>
      </div>
      <div className={cn("audio_list")}>{audioList}</div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["profile"])),
    },
    revalidate: 10,
  };
};

export default Profile;
