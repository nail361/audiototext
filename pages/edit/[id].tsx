import React, {
  useEffect,
  useState,
  ReactElement,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
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

const Paginator = React.lazy(() => import("../../components/paginator"));

const WORDS_PER_PAGE = 300;

type WordFromResponse = {
  id: string;
  confidence: number;
  startTime: string;
  endTime: string;
  word: string;
  originalWord: string;
};

type RecievedTextData = Array<Array<WordFromResponse>>;

const preparedTextDataFun = (data: RecievedTextData): Array<textData> => {
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
        inTime: false,
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
  const [audio, setAudio] = useState<SimpleAudio>();
  const [preparedData, setPreparedTextData] = useState<Array<textData>>([]);
  const [curTime, setCurTime] = useState(0);
  const [correctedTime, setCorrectedTime] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [curPage, setCurPage] = useState(0);
  const textWrapper = useRef<HTMLDivElement>(null);

  let savingTimeout: NodeJS.Timeout;
  const { id } = router.query;

  useEffect(() => {
    const newPreparedTextData = preparedData.map((td) => {
      td.inTime = td.startTime <= curTime && td.endTime > curTime;
      return td;
    });
    setPreparedTextData(newPreparedTextData);
  }, [curTime]);

  const { isLoading, sendRequest } = useAPI();

  const textSpans: Array<ReactNode> = [];

  const paginatedText = (): Array<React.ReactNode> =>
    textSpans.slice(
      curPage * WORDS_PER_PAGE,
      curPage * WORDS_PER_PAGE + WORDS_PER_PAGE
    );

  const onTextBlockClick = (id: string) => {
    const textBlock = preparedData.find((tb) => tb.id == id);

    if (textBlock) setCorrectedTime(textBlock.startTime);
  };

  const onTextBlockChange = (id: string, text: string) => {
    if (preparedData) {
      const newTextData: Array<textData> = preparedData.map((tb) => {
        if (tb.id == id) {
          tb.text = text;
          return tb;
        } else return tb;
      });

      setPreparedTextData(newTextData);
      saveChanges();
    }
  };

  const dialogRevert = () => {
    setPromptDialog(
      //@ts-ignore
      <Prompt
        t={t}
        title={t("revertDialog.title")}
        text={t("revertDialog.text")}
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
    if (preparedData) {
      const newTextData = preparedData.map((tb) => {
        tb.text = tb.originalText;
        return tb;
      });

      setPreparedTextData(newTextData);
      saveChanges();
    }
  };

  const downloadText = () => {
    const computedText: string = preparedData.reduce(
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

  const handlePageClick = (event: any) => {
    setCurPage(event.selected);
    textWrapper.current!.scrollTop = 0;
  };

  if (preparedData) {
    for (let index = 0; index < preparedData.length; index++) {
      textSpans.push(
        <TextBlock
          key={preparedData[index].id}
          id={preparedData[index].id}
          text={preparedData[index].text}
          originalText={preparedData[index].originalText}
          startTime={preparedData[index].startTime}
          inTime={preparedData[index].inTime}
          confidence={preparedData[index].confidence}
          endTime={preparedData[index].endTime}
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

  useEffect(() => {
    if (token.length > 0) getAudio();
  }, [getAudio]);

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
    const response = data.data;
    const preparedTextData = preparedTextDataFun(response.textData);
    setPreparedTextData(preparedTextData);

    setPageCount(Math.ceil(preparedTextData.length / WORDS_PER_PAGE));

    setAudio({
      id: response.id.toString(),
      src: response.src,
      date: response.date,
      duration: response.duration,
      name: response.name,
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
            correctedTime={correctedTime}
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
        <div className={cn("text-block")} ref={textWrapper}>
          {paginatedText()}
        </div>
        {pageCount > 1 && (
          <div className={cn("pagination-wrapper")}>
            <Paginator
              pageCount={pageCount}
              handlePageClick={handlePageClick}
            />
          </div>
        )}
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
