import { useSearchParams, useNavigate } from "react-router-dom";
import { MdOutlineFullscreen, MdFullscreenExit } from "react-icons/md";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { useRef, useState, useCallback, useEffect } from "react";
import { useWhepPlayer } from "../hooks/useWhepPlayer";
import { useStreams } from "../hooks/useStreams";
import { formatElapsed, parseStreamName } from "../utils";
import "../styles/streamview.css";

function StreamView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const name = params.get("name") ?? "";
  const url = name ? `/webrtc/${name}/whep` : null;

  const { streams, loading } = useStreams();
  const stream = streams.find((s) => s.name === name);
  const status = loading ? "loading" : stream ? "online" : "offline";
  const startTime = stream?.onlineTime ? new Date(stream.onlineTime).getTime() : null;
  const { streamName } = parseStreamName(name);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const whepRef = useWhepPlayer(url, status === "online");

  const combinedRef = useCallback(
    (node: HTMLVideoElement | null) => {
      whepRef(node);
      videoRef.current = node;
    },
    [whepRef]
  );

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="sv-root">
      <button className="sv-back" onClick={() => navigate(-1)}>← Back</button>

      {status === "loading" && (
        <div className="sv-overlay">Loading...</div>
      )}

      {status === "offline" && (
        <div className="sv-overlay">
          <p>Stream is not available at the moment.</p>
          <p className="sv-overlay-sub">The page will update automatically when it starts.</p>
        </div>
      )}

      <video
        ref={combinedRef}
        muted
        autoPlay
        playsInline
        className="sv-video"
        style={{ display: status === "online" ? "block" : "none" }}
      />

      {status === "online" && (
        <div className="sv-controls">
          <div className="sv-controls-row">
            <div className="sv-controls-left">
              <span className="sv-badge-live">
                ● LIVE {startTime ? `· ${formatElapsed(elapsed)}` : ""}
              </span>
              <span className="sv-stream-name">{streamName}</span>
            </div>
            <div className="sv-controls-right">
              <button className="sv-btn" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
                {muted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <button className="sv-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                {isFullscreen ? <MdFullscreenExit /> : <MdOutlineFullscreen />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamView;
