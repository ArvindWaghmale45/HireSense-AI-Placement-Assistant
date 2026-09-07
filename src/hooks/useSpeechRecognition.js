import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition({ onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interim = "";
        let final = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += " " + item[0].transcript.trim();
          } else {
            interim += " " + item[0].transcript.trim();
          }
        }

        finalTranscriptRef.current = final.trim();
        const full = (final + " " + interim).trim();

        // Capitalize first letter of output
        const formatted = full.length > 0 ? full.charAt(0).toUpperCase() + full.slice(1) : full;
        setTranscript(formatted);

        if (onResultRef.current) {
          onResultRef.current(formatted);
        }
      };

      recognition.onerror = (event) => {
        // "no-speech" happens during pauses; we want to continue listening!
        if (event.error === "no-speech") {
          return;
        }
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      // Resilient auto-restart on pause
      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            // If restart fails temporarily, try again after short delay
            setTimeout(() => {
              if (isListeningRef.current) {
                try {
                  recognition.start();
                } catch {
                  // ignore
                }
              }
            }, 300);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        isListeningRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // May already be started
        setIsListening(true);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
