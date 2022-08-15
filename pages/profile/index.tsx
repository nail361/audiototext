import type { NextPage, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import Audio from "../../models/audio";
import Prompt from "../../components/prompt";
import ReactPaginate from "react-paginate";
import AudioItem from "../../components/audioItem";

import classNames from "classnames/bind";
import styles from "./profile.module.scss";

const cn = classNames.bind(styles);

const itemsPerPage = 10;

type AudioList = Audio & {
  detecting: boolean;
};

const Profile: NextPage = () => {
  const { t } = useTranslation(["profile", "common"]);
  const router = useRouter();
  const [filesCount, setFilesCount] = useState(0);
  const [audio, setAudio] = useState<AudioList[]>([]);
  const [isUpload, setUpload] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  let audioList = null;

  useEffect(() => {
    getAudio(0);
  }, []);

  const getAudio = (page: number) => {
    //fetch  - взять данные с сервера
    setPageCount(1);

    const audios = [];
    for (let index = 0; index < 6; index++) {
      audios.push({
        id: index.toString(),
        date: "12.30.2022",
        name: `audio${index} so long name for this field`,
        duration: "01:33",
        cost: "500",
        ready: !!(index % 2),
        detecting: false,
      });
    }

    setAudio(audios);
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

  const deleteAudioPrompt = (id: string) => {
    setPromptDialog(
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

  const handlePageClick = (event: any) => {
    const newPage = (event.selected * itemsPerPage) % audio.length;
    console.log(
      `User requested page number ${event.selected}, which is page ${newPage}`
    );

    // getAudio(newPage);
  };

  if (audio.length) {
    audioList = (
      <table className={cn("audio-list__table")}>
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
            <AudioItem
              key={audio.id}
              {...audio}
              onDeleteAudio={deleteAudioPrompt}
              onEditAudio={editAudio}
              onDetectAudio={detectAudio}
              t={t}
            />
          ))}
        </tbody>
      </table>
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
      <div className={cn("audio-list")}>{audioList}</div>
      {pageCount > 1 && (
        <div className={cn("pagination-wrapper")}>
          <ReactPaginate
            className={cn("pagination")}
            pageClassName={cn("page")}
            previousClassName={cn("page", "previous")}
            nextClassName={cn("page", "next")}
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
          />
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

export default Profile;
