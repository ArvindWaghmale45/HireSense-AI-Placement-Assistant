import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition({ onResult, lang = "en-IN" } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [selectedLang, setSelectedLang] = useState(lang);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const previousSessionsTextRef = useRef("");
  const currentSessionFinalRef = useRef("");
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Default to en-IN (English - India) for Indian placement interviews, or user-selected lang
    recognition.lang = selectedLang;

    recognition.onresult = (event) => {
      let currentSessionFinal = "";
      let currentSessionInterim = "";

      // Single-pass parse of current session results without duplication
      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          currentSessionFinal += item[0].transcript + " ";
        } else {
          currentSessionInterim += item[0].transcript;
        }
      }

      currentSessionFinalRef.current = currentSessionFinal;

      // Combine previous sessions with current final & interim
      const combinedFinal = (previousSessionsTextRef.current + " " + currentSessionFinal)
        .replace(/\s+/g, " ")
        .trim();

      const full = (combinedFinal + " " + currentSessionInterim).replace(/\s+/g, " ").trim();

      // Format capital first letter
      const formatted = full.length > 0 ? full.charAt(0).toUpperCase() + full.slice(1) : full;
      setTranscript(formatted);

      if (onResultRef.current) {
        onResultRef.current(formatted);
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" is normal when candidate is thinking
      if (event.error === "no-speech") {
        return;
      }
      console.warn("Speech recognition notice:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Save finalized text from this session before restarting
      if (currentSessionFinalRef.current) {
        previousSessionsTextRef.current = (
          previousSessionsTextRef.current + " " + currentSessionFinalRef.current
        )
          .replace(/\s+/g, " ")
          .trim();
        currentSessionFinalRef.current = "";
      }

      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch {
                // ignore
              }
            }
          }, 200);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

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
  }, [selectedLang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        isListeningRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
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
    previousSessionsTextRef.current = "";
    currentSessionFinalRef.current = "";
    setTranscript("");
  }, []);

  const setLanguage = useCallback((newLang) => {
    setSelectedLang(newLang);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    selectedLang,
    setLanguage,
  };
}
