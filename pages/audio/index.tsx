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
import Audio from "../../models/complexAudio";
import Prompt from "../../components/prompt";
import AudioItem from "../../components/audioItem";
import Loader from "../../components/loader";
import useAPI from "../../hooks/use-api";
import toast from "react-hot-toast";

import classNames from "classnames/bind";
import styles from "./audio.module.scss";

const cn = classNames.bind(styles);

const Paginator = React.lazy(() => import("../../components/paginator"));

const itemsPerPage = 10;
let curDetecting = 0;

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
    status: string;
    totalPages: number;
    data: [
      {
        id: number;
        src: string;
        date: string;
        name: string;
        duration: number;
        is_video: number;
        cost: number;
        ready: boolean;
      }
    ];
  }) => {
    setPageCount(data.totalPages);
    const audio = data.data.map((audioItem) => {
      return {
        ...audioItem,
        ready: !!audioItem.ready,
        detecting: false,
        withVideo: audioItem.is_video == 1,
      };
    });

    setAudio(audio);
  };

  const { isLoading, sendRequest } = useAPI();
  const { isLoading: isUpload, sendRequest: uploadAudioRequest } = useAPI();

  const getAudio = useCallback(
    (page: number) => {
      setCurPage(page);
      sendRequest(
        {
          url: `getAudioList?page=${page}&itemsPerPage=${itemsPerPage}`,
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        },
        onAudioListSuccess
      );
    },
    [sendRequest, token]
  );

  useEffect(() => {
    if (token.length > 0) getAudio(1);
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

    uploadAudioRequest(
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
        duration: number;
        is_video: number;
        cost: number;
        ready: boolean;
      }
    ];
  }) => {
    onAudioListSuccess(data);
  };

  const detectAudio = (id: number, cost: number) => {
    if (money < cost) {
      router.push("/wallet");
      return;
    }

    const newAudio = audio.map((audio) => {
      if (audio.id == id) audio.detecting = true;
      return audio;
    });
    setAudio(newAudio);

    const formData = new FormData();
    formData.append("audioID", id.toString());

    curDetecting = parseInt(id.toString());

    sendRequest(
      {
        url: "detectAudio",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      },
      detectingReady,
      detectingError
    );
  };

  const editAudio = (id: number) => {
    router.push(`/edit/${id}`);
  };

  const deleteAudio = (id: number) => {
    sendRequest(
      {
        url: `deleteAudio?audioID=${id}`,
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      },
      () => {
        const newAudio = audio.filter((audio) => audio.id != id);
        setAudio(newAudio);
      }
    );
  };

  const deleteAudioPrompt = (id: number) => {
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

  const detectingReady = (data: { moneyLeft: number }) => {
    dispatch(walletActions.update(data.moneyLeft));

    const newAudio = audio.map((audio) => {
      if (audio.id == curDetecting) {
        audio.detecting = false;
        audio.ready = true;
      }
      return audio;
    });
    setAudio(newAudio);
  };

  const detectingError = (error: string) => {
    toast.error(error);

    const newAudio = audio.map((audio) => {
      if (audio.id == curDetecting) {
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
          accept="audio/*,video/*"
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
