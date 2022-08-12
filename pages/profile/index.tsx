import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Image from "next/image";

import classNames from "classnames/bind";
import styles from "./profile.module.scss";
import { ChangeEvent, useEffect, useState } from "react";
import Audio from "../../models/audio";

const cn = classNames.bind(styles);

const Profile: NextPage = () => {
  const { t } = useTranslation("profile");
  const router = useRouter();
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
        name: "audio1 so long name for this field",
        duration: "01:33",
        cost: "500",
        ready: false,
        detecting: false,
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

  const detectAudio = (id: string) => {
    const newAudio = audio.map((audio) => {
      if (audio.id == id) audio.detecting = true;
      return audio;
    });
    setAudio(newAudio);

    setTimeout(() => detectingReady(id), 1000);
  };

  const editAudio = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const deleteAudio = (id: string) => {
    const newAudio = audio.filter((audio) => audio.id != id);
    setAudio(newAudio);
  };

  const detectingReady = (id: string) => {
    const newAudio = audio.map((audio) => {
      if (audio.id == id) {
        audio.detecting = false;
        audio.ready = true;
      }
      return audio;
    });
    setAudio(newAudio);
  };

  const detectingError = (id: string) => {
    const newAudio = audio.map((audio) => {
      if (audio.id == id) {
        audio.detecting = false;
      }
      return audio;
    });
    setAudio(newAudio);
  };

  if (audio.length) {
    audioList = (
      <table className={cn("audio_list__table")}>
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
              <td>
                {audio.detecting && <span>loading</span>}
                {!audio.ready && !audio.detecting && (
                  <>
                    <select>
                      <option value="ru">{t("language.ru")}</option>
                      <option value="en">{t("language.en")}</option>
                    </select>
                    <div
                      title={`${t("detect")} ${audio.cost}руб.`}
                      className={cn("audio_list__detect")}
                      onClick={() => detectAudio(audio.id)}
                    >
                      {audio.cost}
                    </div>
                  </>
                )}
                <div
                  title={t("edit")}
                  className={cn("audio_list__edit", {
                    audio_list__edit_hide: !audio.ready,
                  })}
                  onClick={() => editAudio(audio.id)}
                ></div>
                <div
                  title={t("delete")}
                  className={cn("audio_list__delete", {
                    audio_list__delete_hide: audio.detecting,
                  })}
                  onClick={() => deleteAudio(audio.id)}
                ></div>
              </td>
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
