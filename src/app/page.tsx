"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

const START_SECOND = 0;
const END_SECOND = 8.4;

export default function Home() {
  const [phase, setPhase] = useState<"tap" | "dont" | "go" | "done">("tap");
  const [fadeIn, setFadeIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const isPausedRef = useRef(false);
  const audioKilledRef = useRef(false);
  const lastTimeRef = useRef(0);
  const killReasonRef = useRef<"none" | "hidden">("none");
  const [isMuted, setIsMuted] = useState(false);

  // Loop del audio
  useEffect(() => {
    const id = window.setInterval(() => {
      const audio = audioRef.current;
      if (
        audio &&
        !isPausedRef.current &&
        !audio.paused &&
        audio.currentTime >= END_SECOND
      ) {
        audio.currentTime = START_SECOND;
      }
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  // Visibilidad — mute + pause + kill switch
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const hardStop = () => {
      isPausedRef.current = true;
      audioKilledRef.current = true;
      lastTimeRef.current = audio.currentTime || 0;
      audio.muted = true;
      audio.pause();
      setIsMuted(true);
    };

    const onVisibility = () => {
      if (document.hidden) {
        killReasonRef.current = "hidden";
        hardStop();
      }
    };

    const enforceNoPlay = () => {
      if (document.hidden || audioKilledRef.current || isPausedRef.current) {
        audio.muted = true;
        audio.pause();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", hardStop);
    window.addEventListener("pagehide", hardStop);
    audio.addEventListener("play", enforceNoPlay);
    audio.addEventListener("playing", enforceNoPlay);

    if (document.hidden) hardStop();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", hardStop);
      window.removeEventListener("pagehide", hardStop);
      audio.removeEventListener("play", enforceNoPlay);
      audio.removeEventListener("playing", enforceNoPlay);
    };
  }, []);

  // Reanudar SOLO con botón de volumen
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Ya no hay pointerdown global
  }, [phase]);

  const handleStart = () => {
    isPausedRef.current = false;
    audioKilledRef.current = false;
    if (audioRef.current) {
      audioRef.current.src = "/audio/song.mp3";
      audioRef.current.muted = false;
      audioRef.current.currentTime = START_SECOND;
      audioRef.current.play().catch(() => {});
    }
    setPhase("dont");
    setTimeout(() => setPhase("go"), 500);
    setTimeout(() => {
      setPhase("done");
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = 1.5;
      }
      setTimeout(() => setFadeIn(true), 50);
    }, 1000);
  };
  return (
    <div className={styles.pageWrapper}>
      {/* Video fijo detrás de AMBAS secciones */}
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
      <audio ref={audioRef} preload="auto" />

      {/* Header fijo — siempre visible */}
      <div
        className={`${styles.fixedHeader} ${phase === "done" ? styles.fadeIn : styles.fadeOut}`}
      >
        <span className={styles.headerLeft}>FELO</span>
        <div className={styles.headerSocials}>
          <button
            className={styles.volumeBtn}
            onClick={(e) => {
              e.stopPropagation();
              const audio = audioRef.current;
              if (!audio) return;

              if (audioKilledRef.current) {
                // Volvió de estar afuera — reanudar
                audioKilledRef.current = false;
                isPausedRef.current = false;
                audio.currentTime = Math.max(0, lastTimeRef.current);
                audio.muted = false;
                setIsMuted(false);
                audio.play().catch(() => {});
                return;
              }

              if (isMuted) {
                audio.muted = false;
                setIsMuted(false);
                if (audio.paused && phase !== "tap") {
                  isPausedRef.current = false;
                  audio.play().catch(() => {});
                }
              } else {
                audio.muted = true;
                setIsMuted(true);
              }
            }}
            style={{ pointerEvents: "auto" }}
          >
            {isMuted || audioKilledRef.current ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" />
                <path
                  d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            )}
          </button>
          <a
            href="https://tiktok.com/@felitouuuu"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerSocialLink}
          >
            <svg
              width="16"
              height="18"
              viewBox="0 0 448 512"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M448 209.91a210.06 210.06 0 01-122.77-39.25v178.72A162.55 162.55 0 11185 188.31v89.89a74.62 74.62 0 1052.23 71.18V0h88a121.18 121.18 0 001.86 22.17A122.18 122.18 0 00381 102.39a121.43 121.43 0 0067 20.14z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/soyfelo_"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerSocialLink}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span>soyfelo_</span>
          </a>
        </div>
      </div>

      <div
        className={`${styles.mainContent} ${phase === "done" ? (fadeIn ? styles.fadeIn : styles.fadeOut) : styles.fadeOut}`}
      >
        {/* SECCIÓN 1 — Video */}
        <div className={styles.sectionOne}>
          <div className={styles.contentArea}>
            <p className={styles.subtitle}>De Bogotá para Colombia</p>

            <div className={styles.songImage}>
              <Image
                src="/images/song.jpg"
                alt="Song"
                width={220}
                height={220}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <div className={styles.dontgoImage}>
              <Image
                src="/images/dongoat.png"
                alt="DON'T GO"
                width={500}
                height={100}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <p className={styles.feloName}>FELO</p>

            <a
              href="https://open.spotify.com/album/2WUoSUwj7D33zmiyTk69xE?go=1&nd=1&dlsi=54e4e6b33ef442e4"
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
              <span>Spotify</span>
            </a>
            <a
              href="https://music.apple.com/co/artist/felo/1656406679"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.appleMusicBtn}
            >
              <svg
                className={styles.appleMusicIcon}
                viewBox="0 0 384 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              <span>Apple Music</span>
            </a>
          </div>
          <div className={styles.scrollArrow}>
            <span>↓</span>
          </div>
        </div>
        {/* SECCIÓN 2 — Interregno */}
        <div className={styles.sectionTwo}>
          <div className={styles.sectionTwoHeader}>
            <h2 className={styles.sectionTwoTitle}>INTERREGNO</h2>
            <p className={styles.sectionTwoSubtitle}>
              &quot;Bogotá aún no tiene un soberano&quot;
            </p>
          </div>

          <div className={styles.trackList}>
            {/* Fila 1 — Don't Go (ACTUAL) */}
            <div
              className={`${styles.trackRow}`}
              onClick={() => setExpandedRow(expandedRow === 0 ? null : 0)}
            >
              <span className={styles.trackIcon}>🐎</span>
              <span className={styles.trackName}>DON&apos;T GO</span>
              <span className={styles.trackDate}>25 FEBRERO</span>
              <span className={styles.trackNote}>
                &quot;Los comienzos son despedidas. Un adios a una antigua forma
                de vivir&quot;
              </span>
              <span className={styles.trackIconEnd}>🏴</span>
            </div>
            {expandedRow === 0 && (
              <div className={styles.expandedNote}>
                &quot;Los comienzos son despedidas. Un adios a una antigua forma
                de vivir&quot;
              </div>
            )}

            {/* Fila 2 — Espiral */}
            <div
              className={styles.trackRow}
              onClick={() => setExpandedRow(expandedRow === 1 ? null : 1)}
            >
              <span className={styles.trackIcon}>🌀</span>
              <span className={styles.trackName}>ESPIRAL</span>
              <span className={styles.trackDate}>?? MARZO</span>
              <span className={styles.trackNote}>
                &quot;En la turbulencia recordamos que somos nuestro lugar
                seguro&quot;
              </span>
              <span className={styles.trackIconEnd}>⏳</span>
            </div>
            {expandedRow === 1 && (
              <div className={styles.expandedNote}>
                &quot;En la turbulencia recordamos que somos nuestro lugar
                seguro&quot;
              </div>
            )}

            {/* Fila 3 — Te quiero ███ */}
            <div
              className={styles.trackRow}
              onClick={() => setExpandedRow(expandedRow === 2 ? null : 2)}
            >
              <span className={styles.trackIcon}>🖤</span>
              <span className={styles.trackName}>
                TE QUIERO{" "}
                <span className={styles.redacted}>
                  <span className={styles.redactedInner}>XXXXXXXX</span>
                </span>
              </span>
              <span className={styles.trackDate}>?? ABRIL</span>
              <span className={styles.trackNote}>Comming soon</span>
              <span className={styles.trackIconEnd}>⏳</span>
            </div>
            {expandedRow === 2 && (
              <div className={styles.expandedNote}>Comming soon</div>
            )}

            {/* Fila 4 — ███ - YOSHI */}
            <div
              className={styles.trackRow}
              onClick={() => setExpandedRow(expandedRow === 3 ? null : 3)}
            >
              <span className={styles.trackIcon}>🎮</span>
              <span className={styles.trackName}>
                <span className={styles.redacted}>
                  <span className={styles.redactedInner}>XXXXXXXXX</span>
                </span>
                — Y0SHI
              </span>
              <span className={styles.trackDate}>?? ???</span>
              <span className={styles.trackNote}>Comming soon</span>
              <span className={styles.trackIconEnd}>⏳</span>
            </div>
            {expandedRow === 3 && (
              <div className={styles.expandedNote}>Comming soon</div>
            )}

            {/* Separador vertical */}
            <div className={styles.dotSeparator}>
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>

            {/* Fila 5 — Especial */}
            <div
              className={`${styles.trackRowSpecial}`}
              onClick={() => setExpandedRow(expandedRow === 4 ? null : 4)}
            >
              <span className={styles.trackIcon}>✝️</span>
              <span className={styles.trackName}>
                EP{" "}
                <span className={styles.redacted}>
                  <span className={styles.redactedInner}>XXXXXXXX</span>
                </span>
              </span>
              <span className={styles.trackDate}>CONFIDENCIAL</span>
              <span className={`${styles.trackNote} ${styles.grandRelease}`}>
                Lanzamiento especial
              </span>
              <span className={styles.trackIconEnd}>✝️</span>
            </div>
            {expandedRow === 4 && (
              <div className={styles.expandedNote}>Lanzamiento especial</div>
            )}
          </div>
        </div>
      </div>
      {/* Loading screens — encima de todo */}
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
    </div>
  );
}
