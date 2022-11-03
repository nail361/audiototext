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
import { generateUniqId } from "../../utils/utils";

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

type InTimeWord = {
  id: string;
  prevId: string;
  nextId: string;
  startTime: number;
  endTime: number;
  inTime: boolean;
};

type RecievedTextData = Array<Array<WordFromResponse>>;

type complexTextData = textData & {
  prevId: string;
  nextId: string;
  page: number;
};

type PreparedData = Map<string, complexTextData>;

const preparedTextDataFun = (
  data: RecievedTextData
): [PreparedData, Array<Array<string>>] => {
  const preparedData: PreparedData = new Map();
  const pagedWords: Array<Array<string>> = [];

  const flatData = data.flatMap((td: WordFromResponse[]) => {
    pagedWords.push([]);
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

    const page = Math.floor(i / WORDS_PER_PAGE);

    pagedWords[page].push(curData.id);

    preparedData.set(curData.id, {
      id: curData.id,
      prevId,
      nextId,
      confidence: curData.confidence ? curData.confidence : 1,
      startTime: curData.startTime ? parseInt(curData.startTime) : 0,
      endTime: curData.endTime ? parseInt(curData.endTime) : 0,
      text: curData.word,
      originalText: curData.originalWord,
      inTime: false,
      page: page,
    });

    prevId = curData.id;
  }

  return [preparedData, pagedWords];
};

const cashedIdToSave: Set<string> = new Set();
let savingTimeout: NodeJS.Timeout;
let curInTimeWord: InTimeWord;

const Edit: NextPage = () => {
  const { t } = useTranslation("edit");
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [audio, setAudio] = useState<SimpleAudio>();
  const [preparedData, setPreparedTextData] = useState<PreparedData>(new Map());
  const [pagedWords, setPagedWords] = useState<Array<Array<string>>>([]);
  const [correctedTime, setCorrectedTime] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [curPage, setCurPage] = useState(0);
  const textWrapper = useRef<HTMLDivElement>(null);

  const { id } = router.query as string;

  const { isLoading, sendRequest } = useAPI();

  const paginatedText = (): Array<React.ReactNode> => {
    if (!preparedData) return [];

    let j = 0;
    const textSpans: Array<ReactNode> = [];
    textSpans.length = pagedWords[curPage].length;

    for (let i = 0; i < pagedWords[curPage].length; i++) {
      const curData = preparedData.get(pagedWords[curPage][i]);
      if (!curData) continue;
      textSpans[j] = (
        <TextBlock
          key={curData.id}
          id={curData.id}
          text={curData.text}
          originalText={curData.originalText}
          startTime={curData.startTime}
          inTime={curData.inTime}
          confidence={curData.confidence}
          endTime={curData.endTime}
          onClickCallback={onTextBlockClick}
          onChangeCallback={onTextBlockChange}
          createNewTextBlocks={createNewTextBlocks}
        />
      );
      j++;
    }

    return textSpans;
  };

  const onTextBlockClick = (wordId: string) => {
    const textBlock = preparedData?.get(wordId);

    if (textBlock) setCorrectedTime(textBlock.startTime);
  };

  const onTextBlockChange = (wordId: string, text: string) => {
    if (preparedData) {
      const updatedWord = preparedData.get(wordId);
      if (!updatedWord) return;

      updatedWord.text = text;
      setPreparedTextData(new Map(preparedData.set(wordId, updatedWord)));
      saveChanges(wordId);
    }
  };

  const createNewTextBlocks = (id: string, words: string[]) => {
    const curWord = preparedData.get(id);
    const newData = new Map(preparedData);
    let prevId = curWord!.id;

    const preparedId: Array<string> = [];
    const updatedPagedWords = [...pagedWords];
    for (let i = 0; i < words.length; i++) {
      preparedId.push(generateUniqId());
      updatedPagedWords[curPage].push(preparedId[i]);
    }

    for (let i = 0; i < words.length; i++) {
      const text: string = words[i];
      const nextId: string =
        i + 1 < words.length ? preparedId[i + 1] : curWord!.nextId;

      newData.set(preparedId[i], {
        id: preparedId[i],
        confidence: 1,
        inTime: false,
        originalText: text,
        text: text,
        prevId: prevId,
        nextId: nextId,
        page: curPage,
        startTime: 0,
        endTime: 0,
      });
      prevId = preparedId[i];

      saveChanges(preparedId[i]);
    }

    setPreparedTextData(newData);

    console.log(updatedPagedWords[curPage]);
    setPagedWords(updatedPagedWords);
  };

  const deleteWord = (wordId: string) => {
    const newData = new Map(preparedData);

    const wordToDelete = newData.get(wordId);
    if (!wordToDelete) return;

    const prevWord = newData.get(wordToDelete.prevId);
    const nextWord = newData.get(wordToDelete.nextId);

    if (prevWord && nextWord) {
      newData.set(prevWord.id, {
        ...prevWord,
        nextId: nextWord.id,
      });
      newData.set(nextWord.id, {
        ...nextWord,
        prevId: prevWord.id,
      });
    }

    newData.delete(wordId);

    setPreparedTextData(newData);

    const updatedPagedWords = [...pagedWords];
    updatedPagedWords[curPage] = updatedPagedWords[curPage].filter(
      (id: string) => id != wordId
    );
    setPagedWords(updatedPagedWords);
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
      const formData = new FormData();
      formData.append("audioID", id);

      sendRequest(
        {
          url: "resetWords",
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        },
        onAudioGetSuccess
      );
    }
  };

  const downloadText = () => {
    let computedText: string = "";

    preparedData.forEach((value) => {
      computedText += value.text + "";
    });

    DownloadTextFile(audio!.name, computedText);
  };

  const saveChanges = (wordId: string) => {
    cashedIdToSave.add(wordId);

    clearTimeout(savingTimeout);

    savingTimeout = setTimeout(() => {
      clearTimeout(savingTimeout);
      setSaving(true);

      const wordsToSave: Array<{
        id: string;
        beforeId: string;
        afterId: string;
        startTime: string;
        endTime: string;
        text: string;
      }> = [];

      cashedIdToSave.forEach((id) => {
        const word = preparedData.get(id);
        if (word) {
          wordsToSave.push({
            id: word.id,
            beforeId: word.prevId,
            afterId: word.nextId,
            text: word.text,
            startTime: `${word.startTime}s`,
            endTime: `${word.endTime}s`,
          });

          if (word.text == "") {
            deleteWord(word.id);
          }
        }
      });
      /*
      const formData = new FormData();
      formData.append("audioID", id as string);
      formData.append("textData", JSON.stringify(wordsToSave));

      sendRequest(
        {
          url: "saveText",
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        },
        () => {
          setTimeout(() => setSaving(false), 2000);
        }
      );*/
      cashedIdToSave.clear();
    }, 2000);
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
    if (token.length > 0) {
      getAudio();
    }
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
    const [preparedTextData, preparedPagedWords] = preparedTextDataFun(
      response.textData
    );
    setPreparedTextData(preparedTextData);
    setPagedWords(preparedPagedWords);

    setPageCount(Math.ceil(preparedTextData.size / WORDS_PER_PAGE));

    setAudio({
      id: response.id.toString(),
      src: response.src,
      date: response.date,
      duration: response.duration,
      name: response.name,
    });
  };

  const onAudioProgress = (time: number) => {
    if (curInTimeWord == null) {
      const word = preparedData.get(pagedWords[0][0]);
      if (!word) return;
      curInTimeWord = {
        id: word.id,
        prevId: word.prevId,
        nextId: word.nextId,
        startTime: word.startTime,
        endTime: word.endTime,
        inTime: false,
      };
    }

    if (curInTimeWord.startTime <= time && curInTimeWord.endTime > time) {
      if (!curInTimeWord.inTime) {
        curInTimeWord.inTime = true;
        const updatedWord = preparedData.get(curInTimeWord.id);
        if (updatedWord) {
          updatedWord!.inTime = true;
          setPreparedTextData(
            new Map(preparedData.set(curInTimeWord.id, updatedWord))
          );
        }
      }
      return; // до сих пор находимся на том же слове
    } else if (curInTimeWord.inTime) {
      curInTimeWord.inTime = false;
      const updatedWord = preparedData.get(curInTimeWord.id);
      if (updatedWord) {
        updatedWord!.inTime = false;
        setPreparedTextData(
          new Map(preparedData.set(curInTimeWord.id, updatedWord))
        );
      }
    }

    let find = false;
    let nextCheckWord: complexTextData | undefined;

    if (curInTimeWord.endTime > time) {
      nextCheckWord = preparedData.get(curInTimeWord.nextId);
      while (nextCheckWord != null || !find) {
        find = nextCheckWord!.endTime > time;
        nextCheckWord = preparedData.get(nextCheckWord!.nextId);
      }
    } else if (curInTimeWord.startTime > time) {
      nextCheckWord = preparedData.get(curInTimeWord.prevId);
      while (nextCheckWord != null || !find) {
        find = nextCheckWord!.endTime > time;
        nextCheckWord = preparedData.get(nextCheckWord!.prevId);
      }
    }

    if (find && nextCheckWord != null) {
      const newPreparedTextData = new Map(preparedData);

      nextCheckWord.inTime = true;
      newPreparedTextData.set(nextCheckWord.id, nextCheckWord);
      setPreparedTextData(newPreparedTextData);

      if (curPage != nextCheckWord.page) goToPage(nextCheckWord.page);
    }
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
