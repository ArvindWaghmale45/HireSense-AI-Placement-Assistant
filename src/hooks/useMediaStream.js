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

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });

      setStream(mediaStream);
      setHasPermission(true);
      setIsCameraOn(true);
      setIsMicOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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

  // Connect video element when ref updates or stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
