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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera and microphone are not supported in this browser.");
      }

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });
      } catch (firstErr) {
        console.warn("Primary camera constraint failed, falling back to standard video:", firstErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
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
      setError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera/microphone permission was denied. Please allow access in browser settings."
          : err.message || "Failed to access camera/microphone."
      );
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
        if (node.srcObject !== stream) {
          node.srcObject = stream;
        }
        node
          .play()
          .catch((err) => console.warn("Video auto-play prevented or awaiting interaction:", err));
      }
    },
    [stream]
  );

  // Sync video ref when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current
        .play()
        .catch((err) => console.warn("Video auto-play prevented:", err));
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
