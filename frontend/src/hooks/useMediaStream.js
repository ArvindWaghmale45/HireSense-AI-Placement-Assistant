import { useState, useEffect, useRef, useCallback } from "react";

export function useMediaStream() {
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const startStream = useCallback(async () => {
    try {
      setError(null);

      if (typeof window !== "undefined" && window.isSecureContext === false) {
        throw new Error(
          "Your browser blocked the camera because the site is loaded on an insecure connection. Please open http://localhost:5173 (not an IP address) or use HTTPS."
        );
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera device API is not available. Please ensure you are opening http://localhost:5173."
        );
      }

      let mediaStream = null;
      // 1. Try high-definition video-only (avoids conflicting with microphone locks)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        });
      } catch (firstErr) {
        console.warn("HD video constraint failed, trying basic video:", firstErr);
        // 2. Try standard basic video
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (secondErr) {
          console.warn("Video-only failed, attempting combined video and audio:", secondErr);
          // 3. Fallback: try with audio in case driver requires it
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        }
      }

      setStream(mediaStream);
      setHasPermission(true);
      setIsCameraOn(true);
      setIsMicOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play?.().catch(() => {});
      }
      return mediaStream;
    } catch (err) {
      console.warn("Could not start media stream:", err);
      let msg = err.message || "Failed to access camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please click the lock/settings icon in your browser URL bar and allow Camera access.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No webcam camera found on this computer. Please connect a webcam or enable your device camera.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg = "Camera is already in use by another application (Zoom, Teams, or another browser tab). Please close other apps and retry.";
      }
      setError(msg);
      setHasPermission(false);
      return null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const nextState = !videoTrack.enabled;
        videoTrack.enabled = nextState;
        setIsCameraOn(nextState);
      }
    }
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !audioTrack.enabled;
        audioTrack.enabled = nextState;
        setIsMicOn(nextState);
      }
    }
  }, [stream]);

  // Connect video element whenever stream changes or video element mounts
  const attachVideo = useCallback(
    (node) => {
      videoRef.current = node;
      if (node && stream) {
        try {
          node.muted = true;
          node.playsInline = true;
          node.setAttribute("playsinline", "");
          node.setAttribute("webkit-playsinline", "");
          node.setAttribute("muted", "");
          node.setAttribute("autoplay", "");
          if (node.srcObject !== stream) {
            node.srcObject = stream;
          }
          const playPromise = node.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn("Video play error (will retry on metadata):", err);
              node.onloadedmetadata = () => {
                node.play().catch(() => {});
              };
            });
          }
        } catch (e) {
          console.warn("Video attach exception:", e);
        }
      }
    },
    [stream]
  );

  // Sync video ref when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      const node = videoRef.current;
      try {
        node.muted = true;
        node.playsInline = true;
        node.setAttribute("playsinline", "");
        node.setAttribute("webkit-playsinline", "");
        node.setAttribute("muted", "");
        node.setAttribute("autoplay", "");
        if (node.srcObject !== stream) {
          node.srcObject = stream;
        }
        const playPromise = node.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            node.onloadedmetadata = () => {
              node.play().catch(() => {});
            };
          });
        }
      } catch (e) {
        console.warn("Video sync exception:", e);
      }
    }
  }, [stream, isCameraOn]);

  // Cleanup tracks when hook unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    attachVideo,
    stream,
    isCameraOn,
    isMicOn,
    hasPermission,
    error,
    startStream,
    stopStream,
    toggleCamera,
    toggleMic,
  };
}
