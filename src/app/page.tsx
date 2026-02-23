"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [phase, setPhase] = useState<"tap" | "dont" | "go" | "done">("tap");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const START_SECOND = 0; // Segundo donde empieza
  const END_SECOND = 8.8; // Segundo donde vuelve al inicio

  const [fadeIn, setFadeIn] = useState(false);

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = START_SECOND;
      audioRef.current.play().catch(() => {});
    }
    setPhase("dont");

    setTimeout(() => setPhase("go"), 500);
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => setFadeIn(true), 50);
    }, 1000);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= END_SECOND) {
        audio.currentTime = START_SECOND;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  useEffect(() => {
    if (phase === "done" && videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
  }, [phase]);

  return (
    <>
      <audio ref={audioRef} src="/audio/song.wav" preload="auto" />

      {phase === "tap" && (
        <div className={styles.loadingScreen} onClick={handleStart}>
          <p className={styles.tapText}>▶ Bienvenido al nuevo comienzo</p>
        </div>
      )}

      {phase === "dont" && (
        <div className={styles.loadingScreen}>
          <h1 className={styles.loadingText}>DON&apos;T</h1>
        </div>
      )}

      {phase === "go" && (
        <div className={styles.loadingScreen}>
          <h1 className={styles.loadingTextGo}>GO</h1>
        </div>
      )}
      {phase === "done" && (
        <div
          className={`${styles.container} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
        >
          <video
            ref={videoRef}
            className={styles.bgVideo}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/welcome.mp4" type="video/mp4" />
          </video>
          <div className={styles.bgDarken}></div>

          <div className={styles.contentArea}>
            <p className={styles.subtitle}>Bogotá, Colombia</p>

            <div className={styles.songImage}>
              <Image
                src="/images/song.jpg"
                alt="Song"
                width={220}
                height={220}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div className={styles.dontgoImage}>
              <Image
                src="/images/dongoat.png"
                alt="DON'T GO"
                width={500}
                height={100}
                style={{ objectFit: "contain" }}
              />
            </div>

            <p className={styles.feloName}>FELO</p>

            <a
              href="https://open.spotify.com/artist/TU_ARTIST_ID"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.spotifyBtn}
            >
              <svg
                className={styles.spotifyIcon}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Escúchame en Spotify</span>
            </a>

            <a
              href="https://instagram.com/soyfelo_"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.feloBtn}
            >
              @soyfelo_
            </a>
          </div>
        </div>
      )}
    </>
  );
}
