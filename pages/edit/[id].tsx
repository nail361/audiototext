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
type PreparedData = textData & { prevId: string; nextId: string };

const preparedTextDataFun = (data: RecievedTextData): Array<PreparedData> => {
  const preparedData: Array<PreparedData> = [];

  const flatData = data.flatMap((td: WordFromResponse[]) => {
    for (let j = 0; j < td.length; j++) {
      if (j == 0) {
        td[j].word = td[j].word[0].toUpperCase() + td[j].word.slice(1);
        td[j].originalWord =
          td[j].originalWord[0].toUpperCase() + td[j].originalWord.slice(1);
      }
      if (j == td.length - 1) {
        td[j].word = td[j].word + ".";
        td[j].originalWord = td[j].originalWord + ".";
      }
    }

    return td;
  });

  let prevId = "";

  for (let i = 0; i < flatData.length; i++) {
    let nextId = "";
    if (i + 1 < flatData.length) nextId = flatData[i + 1].id;

    const curData = flatData[i];
    if (curData == undefined) continue;

    preparedData.push({
      id: curData.id,
      prevId,
      nextId,
      confidence: curData.confidence,
      startTime: parseInt(curData.startTime),
      endTime: parseInt(curData.endTime),
      text: curData.word,
      originalText: curData.originalWord,
      inTime: false,
    });

    prevId = curData.id;
  }

  return preparedData;
};

const cashedIdToSave: Set<string> = new Set();
let savingTimeout: NodeJS.Timeout;

const Edit: NextPage = () => {
  const { t } = useTranslation("edit");
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [audio, setAudio] = useState<SimpleAudio>();
  const [preparedData, setPreparedTextData] = useState<Array<PreparedData>>([]);
  const [correctedTime, setCorrectedTime] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [curPage, setCurPage] = useState(0);
  const textWrapper = useRef<HTMLDivElement>(null);

  const { id } = router.query;

  const { isLoading, sendRequest } = useAPI();

  const paginatedText = (): Array<React.ReactNode> => {
    const textSpans: Array<ReactNode> = [];
    textSpans.length = WORDS_PER_PAGE;

    let j = 0;
    let end = curPage * WORDS_PER_PAGE + WORDS_PER_PAGE;
    if (end > preparedData.length) end = preparedData.length;
    for (let i = curPage * WORDS_PER_PAGE; i < end; i++) {
      textSpans[j] = (
        <TextBlock
          key={preparedData[i].id}
          id={preparedData[i].id}
          text={preparedData[i].text}
          originalText={preparedData[i].originalText}
          startTime={preparedData[i].startTime}
          inTime={preparedData[i].inTime}
          confidence={preparedData[i].confidence}
          endTime={preparedData[i].endTime}
          onClickCallback={onTextBlockClick}
          onChangeCallback={onTextBlockChange}
        />
      );
      j++;
    }

    return textSpans;
  };

  const onTextBlockClick = (id: string) => {
    const textBlock = preparedData.find((tb) => tb.id == id);

    if (textBlock) setCorrectedTime(textBlock.startTime);
  };

  const onTextBlockChange = (id: string, text: string) => {
    if (preparedData) {
      const newTextData: Array<PreparedData> = preparedData.map((tb) => {
        if (tb.id == id) {
          tb.text = text;
          return tb;
        } else return tb;
      });

      setPreparedTextData(newTextData);
      saveChanges(id);
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
      //send to server event
    }
  };

  const downloadText = () => {
    const computedText: string = preparedData.reduce(
      (accumulator, nextValue) => (accumulator += nextValue.text + " "),
      ""
    );

    DownloadTextFile(audio!.name, computedText);
  };

  const saveChanges = (id: string) => {
    console.log(id);
    cashedIdToSave.add(id);

    clearTimeout(savingTimeout);

    savingTimeout = setTimeout(() => {
      clearTimeout(savingTimeout);
      setSaving(true);

      const wordsToSave: Array<{
        id: string;
        beforeId: string;
        afterId: string;
        text: string;
      }> = [];

      for (let i = 0; i < preparedData.length; i++) {
        if (cashedIdToSave.has(preparedData[i].id)) {
          wordsToSave.push({
            id: preparedData[i].id,
            beforeId: preparedData[i].prevId,
            afterId: preparedData[i].nextId,
            text: preparedData[i].text,
          });
        }
      }

      const formData = new FormData();
      formData.append("textData", JSON.stringify(wordsToSave));

      sendRequest(
        {
          url: "saveText",
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        },
        () => {
          setSaving(false);
        }
      );
      cashedIdToSave.clear();
    }, 5000);
  };

  const goToPage = (pageNumber: number) => {
    setCurPage(pageNumber);
    textWrapper.current!.scrollTop = 0;
  };

  const handlePageClick = (event: any) => {
    goToPage(event.selected);
  };

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
    let inTimeIndex = -1;
    const newPreparedTextData = preparedData.map((td, index) => {
      td.inTime = td.startTime <= time && td.endTime > time;
      if (td.inTime) inTimeIndex = index;
      return td;
    });

    const newPage = Math.floor(inTimeIndex / WORDS_PER_PAGE);
    if (inTimeIndex >= 0 && curPage != newPage) goToPage(newPage);

    setPreparedTextData(newPreparedTextData);
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
          <span className={cn("controls-block__date")}>
            {new Date(audio.date).toLocaleString()}
          </span>
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

export default React.memo(Edit);
