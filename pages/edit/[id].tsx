import React, {
  useEffect,
  useState,
  ReactElement,
  useCallback,
  ReactNode,
  useRef,
  ChangeEvent,
} from "react";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import SimpleAudio from "../../models/simpleAudio";
import Player from "../../components/player";
import TextBlock from "../../components/textBlock";
import { textData } from "../../types/textData";
import useAPI from "../../hooks/use-api";
import SimplePrompt from "../../components/prompt/simple";

import DownloadTextFile from "../../utils/downloadTextFile";
import { generateUniqId } from "../../utils/utils";

import classNames from "classnames/bind";
import styles from "./edit.module.scss";

const cn = classNames.bind(styles);

const Paginator = React.lazy(() => import("../../components/paginator"));

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
  startTime: number;
  endTime: number;
};

type RecievedTextData = Array<Array<WordFromResponse>>;

type complexTextData = textData & {
  prevId: string;
  nextId: string;
  page: number;
};

type PreparedData = Map<string, complexTextData>;

const preparedTextDataFun = (
  data: RecievedTextData,
  wordsPerPage: number
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

    const page = Math.floor(i / wordsPerPage);

    pagedWords[page].push(curData.id);

    preparedData.set(curData.id, {
      id: curData.id,
      prevId,
      nextId,
      confidence: curData.confidence ? curData.confidence : 1,
      startTime: curData.startTime ? parseFloat(curData.startTime) : 0,
      endTime: curData.endTime ? parseFloat(curData.endTime) : 0,
      text: curData.word,
      originalText: curData.originalWord,
      inTime: false,
      page: page,
    });

    prevId = curData.id;
  }

  return [preparedData, pagedWords];
};

const DELTA_WORDS = 50;
const cashedIdToSave: Set<string> = new Set();
let savingTimeout: NodeJS.Timeout;
let curInTimeWord: InTimeWord | null;

type TypePageProps = {
  id: string;
};

const Edit: NextPage<TypePageProps> = (params) => {
  const { t } = useTranslation("edit");
  const token = useSelector((state: RootState) => state.auth.token);
  const [audio, setAudio] = useState<SimpleAudio>();
  const [preparedData, setPreparedTextData] = useState<PreparedData>(new Map());
  const [pagedWords, setPagedWords] = useState<Array<Array<string>>>([]);
  const [correctedTime, setCorrectedTime] = useState(0);
  const [promptDialog, setPromptDialog] = useState<ReactElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [curPage, setCurPage] = useState(0);
  const curPageRef = useRef<number>();
  const [wordsPerPage, setWordsPerPage] = useState(300);
  const textWrapper = useRef<HTMLDivElement>(null);

  curPageRef.current = curPage;

  const { id } = params;

  const { isLoading, sendRequest } = useAPI();

  useEffect(() => {
    if (pagedWords.length == 0) return;
    if (Math.abs(pagedWords[curPage].length - wordsPerPage) > DELTA_WORDS) {
      updatePagedWords(wordsPerPage);
    }
  }, [pagedWords[curPage]?.length]);

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
      setPreparedTextData(
        (prevState) => new Map(prevState.set(wordId, updatedWord))
      );
      saveChanges(wordId);
    }
  };

  const createNewTextBlocks = (id: string, words: string[]) => {
    const curWord = preparedData.get(id);

    if (!curWord) return;

    let prevId = curWord.id;

    const preparedId: Array<string> = [];
    const updatedPagedWords = pagedWords[curPage];
    for (let i = 0; i < words.length; i++) {
      preparedId.push(generateUniqId());
    }

    const index = updatedPagedWords.findIndex(
      (wordId: string) => wordId == curWord.id
    );

    updatedPagedWords.splice(index + 1, 0, ...preparedId);

    setPagedWords((prevState) => {
      prevState[curPage] = updatedPagedWords;
      return prevState;
    });

    for (let i = 0; i < words.length; i++) {
      const text: string = words[i];
      const nextId: string =
        i + 1 < words.length ? preparedId[i + 1] : curWord.nextId;

      const newWord = {
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
      };

      setPreparedTextData((prevState) => prevState.set(preparedId[i], newWord));

      prevId = preparedId[i];

      saveChanges(preparedId[i]);
    }

    curWord.nextId = preparedId[0];
    setPreparedTextData((prevState) => prevState.set(curWord.id, curWord));
  };

  const deleteWord = (wordId: string) => {
    const updatedPagedWords = pagedWords[curPage].filter(
      (id: string) => id != wordId
    );

    setPagedWords((prevState) => {
      prevState[curPage] = updatedPagedWords;
      return prevState;
    });

    const wordToDelete = preparedData.get(wordId);
    if (!wordToDelete) return;

    const prevWord = preparedData.get(wordToDelete.prevId);
    const nextWord = preparedData.get(wordToDelete.nextId);

    const newTextData = new Map(preparedData);

    if (prevWord) {
      newTextData.set(prevWord.id, {
        ...prevWord,
        nextId: nextWord ? nextWord.id : "",
      });
    }
    if (nextWord) {
      newTextData.set(nextWord.id, {
        ...nextWord,
        prevId: prevWord ? prevWord.id : "",
      });
    }

    newTextData.delete(wordId);

    setPreparedTextData(newTextData);
  };

  const dialogRevert = () => {
    setPromptDialog(
      <SimplePrompt
        title={t("revertDialog.title")}
        text={t("revertDialog.text")}
        acceptText={t("revertDialog.acceptText")}
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

      const formData = new FormData();
      formData.append("audioID", id as string);
      formData.append("textData", JSON.stringify(wordsToSave));

      // sendRequest(
      //   {
      //     url: "saveText",
      //     method: "POST",
      //     headers: { Authorization: "Bearer " + token },
      //     body: formData,
      //   },
      //   () => {
      //     setTimeout(() => setSaving(false), 2000);
      //   }
      // );
      cashedIdToSave.clear();
    }, 2000);
  };

  const onWordsPerPageSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const newWordsPerPage = parseInt(event.target.value);
    setWordsPerPage(newWordsPerPage);
    updatePagedWords(newWordsPerPage);
  };

  const updatePagedWords = (wordsPerPage: number) => {
    const flatPagedWords = pagedWords.flat();
    const newPagedWords: Array<Array<string>> = [];

    const newPageCount = Math.ceil(preparedData.size / wordsPerPage);
    setPageCount(newPageCount);

    for (let i = 0; i < flatPagedWords.length; i += wordsPerPage) {
      let j = 0;
      newPagedWords.push([]);
      while (wordsPerPage > j && flatPagedWords.length > i + j) {
        newPagedWords[newPagedWords.length - 1].push(flatPagedWords[i + j]);
        j++;
      }
    }

    setPagedWords((prevState) => newPagedWords);
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
      duration: number;
      id: number;
      name: string;
      src: string;
      is_video: number;
      textData: RecievedTextData;
    };
  }) => {
    const response = data.data;
    const [preparedTextData, preparedPagedWords] = preparedTextDataFun(
      response.textData,
      wordsPerPage
    );
    setPreparedTextData(preparedTextData);
    setPagedWords(preparedPagedWords);

    setPageCount(Math.ceil(preparedTextData.size / wordsPerPage));

    setAudio({
      id: response.id,
      src: response.src,
      date: response.date,
      duration: response.duration,
      name: response.name,
      withVideo: response.is_video == 1,
    });
  };

  const onAudioProgress = (time: number) => {
    if (curInTimeWord != null) {
      if (!(curInTimeWord.startTime <= time && time < curInTimeWord.endTime)) {
        const word = preparedData.get(curInTimeWord.id)!;
        word.inTime = false;
        setPreparedTextData(
          (prevState) => new Map(prevState.set(word.id, word))
        );
        curInTimeWord = null;
      }
    }

    if (curInTimeWord == null) {
      let findPage: number = curPageRef.current ? curPageRef.current : 0;
      let counter: number = 0;
      //ищем на какой странице слово
      while (findPage >= 0 && counter < 5) {
        const firstPageWord = preparedData.get(pagedWords[findPage][0])!;
        const lastPageWord = preparedData.get(
          pagedWords[findPage][pagedWords[findPage].length - 1]
        )!;

        if (time > lastPageWord.endTime) {
          findPage++;
          if (findPage >= pagedWords.length) findPage = -1;
        } else if (firstPageWord.startTime > time) {
          findPage--;
        } else {
          //нашли нужную страницу
          break;
        }

        counter++;
      }

      if (findPage >= 0) {
        setCurPage(findPage);

        //ищем конкретное слово на найденной странице
        for (let i = 0; i < pagedWords[findPage].length; i++) {
          const word = preparedData.get(pagedWords[findPage][i])!;
          if (word.startTime <= time && time < word.endTime) {
            curInTimeWord = {
              id: word.id,
              startTime: word.startTime,
              endTime: word.endTime,
            };
            word.inTime = true;
            setPreparedTextData(
              (prevState) => new Map(prevState.set(word.id, word))
            );
            break;
          }
        }
      }
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
          <Player
            src={audio.src}
            withVideo={audio.withVideo}
            duration={audio.duration}
            correctedTime={correctedTime}
            onAudioProgress={onAudioProgress}
          />
        </div>
        <div className={cn("controls-block")}>
          <div>
            <select
              name="wordsPerPageSelect"
              id="wordsPerPageSelect"
              defaultValue={300}
              className={cn("controls-block__select")}
              onChange={onWordsPerPageSelect}
            >
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="500">500</option>
            </select>
            <label htmlFor="wordsPerPageSelect">{t("wordsPerPage")}</label>
          </div>
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
              curPage={curPage}
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
  const id: string = context!.params!.id as string;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["edit"])),
      id,
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
