import React, { useCallback } from "react";
import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Image from "next/future/image";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { RootState } from "../../store";
import { useSelector, useDispatch } from "react-redux";
import { walletActions } from "../../store/wallet";
import Audio from "../../models/audio";
import Prompt from "../../components/prompt";
import AudioItem from "../../components/audioItem";
import Loader from "../../components/loader";
import useAPI from "../../hooks/use-api";

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
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const [filesCount, setFilesCount] = useState(0);
  const [audio, setAudio] = useState<AudioList[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [curPage, setCurPage] = useState(1);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  let audioList = null;

  const onAudioListSuccess = (data: {
    status: "string";
    totalPages: number;
    data: [
      {
        id: string;
        src: string;
        date: string;
        name: string;
        duration: string;
        cost: number;
        ready: boolean;
      }
    ];
  }) => {
    setPageCount(data.totalPages);

    const audio = data.data.map((audioItem) => {
      return { ...audioItem, ready: !!audioItem.ready, detecting: false };
    });

    setAudio(audio);
  };

  const { isLoading, sendRequest } = useAPI();
  const { isLoading: isUpload, sendRequest: uploadAudio } = useAPI();

  const getAudio = useCallback(
    (page: number) => {
      setCurPage(page);
      const formData = new FormData();
      formData.append("page", page.toString());
      formData.append("itemsPerPage", itemsPerPage.toString());

      sendRequest(
        {
          url: "getAudioList",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        },
        onAudioListSuccess
      );
    },
    [sendRequest, token]
  );

  useEffect(() => {
    getAudio(1);
  }, [getAudio]);

  const readFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target!.files;
    if (!files) {
      return;
    }

    // setFilesCount(files.length);
    sendAudioToServer(files);
  };

  const sendAudioToServer = (files: FileList) => {
    const formData = new FormData();
    formData.append("page", curPage.toString());
    formData.append("itemPerPage", itemsPerPage.toString());

    for (let i = 0; i < files.length; i++) {
      formData.append("file[]", files[i]);
    }

    uploadAudio(
      {
        url: "uploadAudio",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      },
      onUploadSuccess
    );
  };

  const onUploadSuccess = (data: {
    status: string;
    totalPages: number;
    data: [
      {
        id: number;
        src: string;
        date: string;
        name: string;
        duration: string;
        cost: string;
        ready: boolean;
      }
    ];
  }) => {
    onAudioListSuccess(data);
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
    const newPage = event.selected + 1;
    getAudio(newPage);
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
                "icon-wrapper__icon_spin": isUpload,
              })}
              src={isUpload ? "/icons/loading.png" : "/icons/upload.png"}
              alt="Выбрать файл"
              width={25}
              height={25}
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
        {isLoading && <Loader height="100px" />}
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
      ...(await serverSideTranslations(locale, ["audio", "common"])),
    },
    revalidate: 10,
  };
};

export default Audio;
