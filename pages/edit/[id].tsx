import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState, ReactElement, useCallback } from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import SimpleAudio from "../../models/simpleAudio";
import AudioPlayer from "../../components/audioPlayer";
import TextBlock from "../../components/textBlock";
import { textData } from "../../types/textData";
import useAPI from "../../hooks/use-api";
import Prompt from "../../components/prompt";

import DownloadTextFile from "../../utils/downloadTextFile";

import classNames from "classnames/bind";
import styles from "./edit.module.scss";

const cn = classNames.bind(styles);

type AudioEdit = SimpleAudio & {
  textData: Array<textData>;
};

type WordFromResponse = {
  id: string;
  confidence: number;
  startTime: string;
  endTime: string;
  word: string;
  originalWord: string;
};

type RecievedTextData = Array<Array<WordFromResponse>>;

const preparedTextData = (data: RecievedTextData): Array<textData> => {
  const preparedData: Array<textData> = [];

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      let word = data[i][j].word;
      if (j == 0) word = word[0].toUpperCase() + word.slice(1);
      if (j == data[i].length - 1) word += ".";

      preparedData.push({
        id: data[i][j].id,
        confidence: data[i][j].confidence,
        startTime: parseInt(data[i][j].startTime),
        endTime: parseInt(data[i][j].endTime),
        text: word,
        originalText: data[i][j].originalWord,
      });
    }
  }

  return preparedData;
};

const Edit: NextPage = () => {
  const { t } = useTranslation("edit");
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [audio, setAudio] = useState<AudioEdit | null>(null);
  const [curTime, setCurTime] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  const [saving, setSaving] = useState(false);
  let savingTimeout: NodeJS.Timeout;
  const { id } = router.query;

  useEffect(() => {
    if (token.length > 0) getAudio();
  }, [getAudio]);

  const { isLoading, sendRequest } = useAPI();

  const textSpans = [];

  const onTextBlockClick = (id: string) => {
    const textBlock = audio?.textData.find((tb) => tb.id == id);

    if (textBlock) onAudioProgress(textBlock.startTime);
  };

  const onTextBlockChange = (id: string, text: string) => {
    if (audio?.textData) {
      const newTextData: Array<textData> = audio.textData.map((tb) => {
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
      //@ts-ignore
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
          confidence={audio.textData[index].confidence}
          endTime={audio.textData[index].endTime}
          onClickCallback={onTextBlockClick}
          onChangeCallback={onTextBlockChange}
        />
      );
    }
  }

  const getAudio = useCallback(() => {
    sendRequest(
      {
        url: `getDetectedAudio?audioID=${id}`,
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      },
      onAudioGetSuccess
    );
  }, [sendRequest, token]);

  const onAudioGetSuccess = (data: {
    data: {
      date: string;
      duration: string;
      id: number;
      name: string;
      src: string;
      textData: RecievedTextData;
    };
  }) => {
    console.log(data);

    const response = data.data;

    setAudio({
      id: response.id.toString(),
      src: response.src,
      date: response.date,
      duration: response.duration,
      name: response.name,
      textData: preparedTextData(response.textData),
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
          <span className={cn("controls-block__date")}>{audio.date}</span>
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
        <div className={cn("text-block")} contentEditable="true">
          {textSpans}
        </div>
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
