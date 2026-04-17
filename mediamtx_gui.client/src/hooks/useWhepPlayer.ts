import { useEffect, useState } from "react";

export function useWhepPlayer(url: string | null, enabled = true) {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!url || !videoEl || !enabled) return;

    let cancelled = false;
    const pc = new RTCPeerConnection();

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    pc.ontrack = (e) => { if (!cancelled && e.streams[0]) videoEl.srcObject = e.streams[0]; };
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        videoEl.play().catch(() => {});
      }
    };

    (async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") { resolve(); return; }
        pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === "complete") resolve(); };
      });

      if (cancelled) return;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription!.sdp,
      });

      if (cancelled || !res.ok) return;

      await pc.setRemoteDescription({ type: "answer", sdp: await res.text() });
    })().catch(console.error);

    return () => {
      cancelled = true;
      pc.close();
      videoEl.srcObject = null;
      videoEl.pause();
    };
  }, [url, videoEl, enabled]);

  return setVideoEl;
}
