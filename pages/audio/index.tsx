import React from "react";
import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { RootState } from "../../store";
import { useSelector, useDispatch } from "react-redux";
import { walletActions } from "../../store/wallet";
import Audio from "../../models/audio";
import Prompt from "../../components/prompt";
import AudioItem from "../../components/audioItem";
import Loader from "../../components/loader";

import classNames from "classnames/bind";
import styles from "./audio.module.scss";

const cn = classNames.bind(styles);

const Paginator = React.lazy(() => import("../../components/paginator"));

const itemsPerPage = 10;

type AudioList = Audio & {
  detecting: boolean;
};

const Audio: NextPage = () => {
  const { t } = useTranslation(["audio", "common"]);
  const money = useSelector((state: RootState) => state.wallet.money);
  const dispatch = useDispatch();
  const router = useRouter();
  const [filesCount, setFilesCount] = useState(0);
  const [audio, setAudio] = useState<AudioList[]>([]);
  const [isUpload, setUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  let audioList = null;

  useEffect(() => {
    getAudio(0);
  }, []);

  const getAudio = (page: number) => {
    setLoading(true);
    //fetch  - взять данные с сервера
    setPageCount(1);

    const audios = [];
    for (let index = 0; index < 6; index++) {
      audios.push({
        id: index.toString(),
        src: "https://cdn.drivemusic.me/dl/online/SJdIvsBU7UHNBqDUeHd9BQ/1660688637/download_music/2014/05/nico-vinz-am-i-wrong.mp3",
        date: "12.30.2022",
        name: `audio${index} so long name for this field`,
        duration: "01:33",
        cost: 500,
        ready: !!(index % 2),
        detecting: false,
      });
    }

    setAudio(audios);

    setLoading(false);
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

  const detectAudio = (id: string, cost: number) => {
    if (money < cost) {
      router.push("/wallet");
      return;
    }

    const newAudio = audio.map((audio) => {
      if (audio.id == id) audio.detecting = true;
      return audio;
    });
    setAudio(newAudio);

    //fetch

    setTimeout(() => detectingReady(id, 100), 1000);
  };

  const editAudio = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const deleteAudio = (id: string) => {
    const newAudio = audio.filter((audio) => audio.id != id);
    setAudio(newAudio);
  };

  const deleteAudioPrompt = (id: string) => {
    setPromptDialog(
      //@ts-ignore
      <Prompt
        t={t}
        title={t("delete_prompt.title")}
        text={t("delete_prompt.text")}
        onAccept={() => {
          deleteAudio(id);
          closePromptDialog();
        }}
        onDeny={closePromptDialog}
      />
    );
  };

  const closePromptDialog = () => {
    setPromptDialog(null);
  };

  const detectingReady = (id: string, moneyLeft: number) => {
    dispatch(walletActions.update(moneyLeft));

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

  const handlePageClick = (event: any) => {
    const newPage = (event.selected * itemsPerPage) % audio.length;
    console.log(
      `User requested page number ${event.selected}, which is page ${newPage}`
    );

    // getAudio(newPage);
  };

  if (audio.length) {
    audioList = (
      <>
        <div className={cn("caption")}>
          <h3>{t("table.caption")}</h3>
        </div>
        <div className={cn("head")}>
          <div>{t("table.date")}</div>
          <div>{t("table.name")}</div>
          <div>{t("table.duration")}</div>
        </div>
        <div className={cn("body")}>
          {audio.map((audio) => (
            //@ts-ignore
            <AudioItem
              key={audio.id}
              {...audio}
              onDeleteAudio={deleteAudioPrompt}
              onEditAudio={editAudio}
              onDetectAudio={detectAudio}
              t={t}
            />
          ))}
        </div>
      </>
    );
  } else {
    audioList = <span>{t("no_audio")}</span>;
  }

  return (
    <>
      {promptDialog}
      <div className={cn("file-uploader")}>
        <input
          name="file-uploader"
          id="file-uploader"
          multiple
          type="file"
          accept="audio/*"
          className={cn("file-uploader__input")}
          onChange={readFiles}
        />
        <label
          htmlFor="file-uploader"
          className={cn("file-uploader__btn", {
            "file-uploader__btn_disabled": isUpload,
          })}
        >
          <span className={cn("icon-wrapper")}>
            <Image
              className={cn("icon-wrapper__icon", {
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
      <div className={cn("audio-list")}>
        {loading && <Loader height="100px" />}
        {audioList}
      </div>
      {pageCount > 1 && (
        <div className={cn("pagination-wrapper")}>
          <Paginator pageCount={pageCount} handlePageClick={handlePageClick} />
        </div>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["profile", "common"])),
    },
    revalidate: 10,
  };
};

export default Audio;
