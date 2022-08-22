import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState, ReactElement, useCallback } from "react";
import Audio from "../../models/audio";
import AudioPlayer from "../../components/audioPlayer";
import TextBlock from "../../components/textBlock";
import { textData } from "../../types/textData";
import Prompt from "../../components/prompt";

import DownloadTextFile from "../../utils/downloadTextFile";

import classNames from "classnames/bind";
import styles from "./edit.module.scss";

const cn = classNames.bind(styles);

type AudioEdit = Audio & {
  textData: textData[];
};

const Edit: NextPage = () => {
  const { t } = useTranslation("edit");
  const router = useRouter();
  const [audio, setAudio] = useState<AudioEdit | null>(null);
  const [curTime, setCurTime] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  const [saving, setSaving] = useState(false);
  let savingTimeout: NodeJS.Timeout;
  const { id } = router.query;

  useEffect(() => {
    getAudio();
  }, []);

  const textSpans = [];

  const onTextBlockClick = (id: string) => {
    const textBlock = audio?.textData.find((tb) => tb.id == id);

    if (textBlock) onAudioProgress(textBlock.startTime);
  };

  const onTextBlockChange = (id: string, text: string) => {
    if (audio?.textData) {
      const newTextData: textData[] = audio.textData.map((tb) => {
        if (tb.id == id) {
          tb.text = text;
          return tb;
        } else return tb;
      });

      const newAudio = {
        ...audio,
        texData: newTextData,
      };

      setAudio(newAudio);
      saveChanges();
    }
  };

  const dialogRevert = () => {
    setPromptDialog(
      <Prompt
        t={t}
        title={t("delete_prompt.title")}
        text={t("delete_prompt.text")}
        onAccept={() => {
          revertTextToOriginal();
          closePromptDialog();
        }}
        onDeny={closePromptDialog}
      />
    );
  };

  const closePromptDialog = () => {
    setPromptDialog(null);
  };

  const revertTextToOriginal = () => {
    if (audio?.textData) {
      const newTextData = audio.textData.map((tb) => {
        tb.text = tb.originalText;
        return tb;
      });
      const newAudio = {
        ...audio,
        texData: newTextData,
      };

      setAudio(newAudio);
      saveChanges();
    }
  };

  const downloadText = () => {
    const computedText: string = audio!.textData.reduce(
      (accumulator, nextValue) => (accumulator += nextValue.text + " "),
      ""
    );

    DownloadTextFile(audio!.name, computedText);
  };

  const saveChanges = () => {
    setSaving(true);

    clearTimeout(savingTimeout);

    savingTimeout = setTimeout(() => {
      // send changes to server
      setSaving(false);
    }, 1000);
  };

  if (audio) {
    for (let index = 0; index < audio.textData.length; index++) {
      textSpans.push(
        <TextBlock
          key={audio.textData[index].id}
          id={audio.textData[index].id}
          text={audio.textData[index].text}
          originalText={audio.textData[index].originalText}
          startTime={audio.textData[index].startTime}
          curTime={curTime}
          endTime={audio.textData[index].endTime}
          onClickCallback={onTextBlockClick}
          onChangeCallback={onTextBlockChange}
        />
      );
    }
  }

  const getAudio = () => {
    //fetch id --получить аудио с сервака

    setAudio({
      id: "1",
      src: "https://cdn.drivemusic.me/dl/online/SJdIvsBU7UHNBqDUeHd9BQ/1660688637/download_music/2014/05/nico-vinz-am-i-wrong.mp3",
      date: "14.02.2022",
      name: "супер длинное имя",
      duration: "1:30",
      cost: "",
      ready: true,
      textData: [
        {
          id: "1",
          text: "привет",
          originalText: "привет",
          startTime: 0,
          endTime: 30,
        },
        {
          id: "2",
          text: "как",
          originalText: "как",
          startTime: 30,
          endTime: 45,
        },
        {
          id: "3",
          text: "дела",
          originalText: "дела",
          startTime: 45,
          endTime: 56,
        },
      ],
    });
  };

  const onAudioProgress = (time: number) => {
    setCurTime(time);
  };

  if (!audio) {
    return <p>Loading</p>;
  }

  return (
    <>
      {promptDialog}
      <div className={cn("wrapper")}>
        <div className={cn("audio-block")}>
          <AudioPlayer
            audioSrc={audio.src}
            duration={audio.duration}
            curTime={curTime}
            onAudioProgress={onAudioProgress}
          />
        </div>
        <div className={cn("controls-block")}>
          <div className={cn("save-icon", { "save-icon_hide": !saving })} />
          <span className={cn("controls-block__name")}>{audio.name}</span>
          <span>{audio.date}</span>
          <div
            className={cn("controls-block__download")}
            onClick={downloadText}
            title={t("download")}
          />
          <div
            className={cn("controls-block__revert")}
            onClick={dialogRevert}
            title={t("revert")}
          />
        </div>
        <div className={cn("text-block")}>{textSpans}</div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale!;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["edit"])),
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export default Edit;
