import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Audio from "../../models/audio";
import AudioPlayer from "../../components/audioPlayer";

import classNames from "classnames/bind";
import styles from "./edit.module.scss";

const cn = classNames.bind(styles);

type AudioEdit = Audio & {
  textData: [
    {
      id: string;
      text: string;
      startTime: number;
    }
  ];
};

const Edit: NextPage = () => {
  const { t } = useTranslation("edit");
  const router = useRouter();
  const [audio, setAudio] = useState<AudioEdit | null>(null);
  const { id } = router.query;

  useEffect(() => {
    getAudio();
  }, []);

  const textSpans = [];

  if (audio) {
    for (let index = 0; index < audio.textData.length; index++) {
      const span = (
        <span key={audio.textData[index].id} className={cn("text")}>
          {audio?.textData[index].text}
        </span>
      );

      textSpans.push(span);
    }
  }

  const getAudio = () => {
    //fetch id --получить аудио с сервака

    setAudio({
      id: "1",
      src: "https://cdn.drivemusic.me/dl/online/SJdIvsBU7UHNBqDUeHd9BQ/1660688637/download_music/2014/05/nico-vinz-am-i-wrong.mp3",
      date: "14.02.2022",
      name: "name",
      duration: "1:30",
      cost: "",
      ready: true,
      textData: [
        {
          id: "1",
          text: "привет",
          startTime: 0,
        },
      ],
    });
  };

  if (!audio) {
    return <p>Loading</p>;
  }

  return (
    <div className={cn("wrapper")}>
      <div className={cn("audio-block")}>
        <AudioPlayer
          audioSrc={audio.src}
          duration={audio.duration}
          name={audio.name}
        />
      </div>
      <div className={cn("text-block")}>{textSpans}</div>
    </div>
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
