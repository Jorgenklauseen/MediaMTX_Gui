/* 

This is not in use at the moment as WebRTC is integrated and HLS is not needed as WebRTC is more efficient, 
but we keep it here for future use if we want to add HLS support in the future.

*/
import { useRef, useEffect } from "react";
import Hls from "hls.js";

export function useHls(url: string | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!url) return;

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play();
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
      video.src = "";
    };
  }, [url]);

  return videoRef;
}