import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserInterviews, listInterviews, saveInterview } from "@/lib/api/interviews";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  generateAiQuestions,
  evaluateAiAnswer,
  transcribeSpokenAudio,
  speakQuestion,
  stopSpeaking,
  INTERVIEW_TOPICS,
} from "@/lib/api/ai";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User as UserIcon,
  CheckCircle2,
  CircleAlert,
  Loader2,
  RotateCcw,
  BookOpen,
  Activity,
  Play,
  Headphones,
} from "lucide-react";

export default function Interview() {
  return (
    <AppShell>
      <InterviewBody />
    </AppShell>
  );
}

function InterviewBody() {
  const { user } = useAuth();
  const [stage, setStage] = useState("setup");
  const [type, setType] = useState("TECHNICAL");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [count, setCount] = useState(5);
  const [enableCamera, setEnableCamera] = useState(true);
  const [focusTopic, setFocusTopic] = useState("ALL");
  const [customTopic, setCustomTopic] = useState("");

  // Interview state
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const SESSION_STORAGE_KEY = "hiresense:active_interview_session";

  // Candidate camera hook
  const {
    videoRef,
    attachVideo,
    isCameraOn,
    isMicOn,
    startStream,
    stopStream,
    toggleCamera,
    toggleMic,
    error: mediaError,
  } = useMediaStream();

  // High-sensitivity far-field Audio Recorder hook with real-time dB visualizer
  const {
    isRecording,
    audioBlob,
    audioLevel,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);

  // Voice speech-to-text hook with accent selection and no duplication
  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    selectedLang,
    setLanguage,
  } = useSpeechRecognition({
    lang: "en-IN",
    onResult: (spokenText) => {
      setAnswer(spokenText);
    },
  });

  const handleAiTranscribe = async () => {
    if (!audioBlob) {
      toast.info("Record audio first using the microphone button.");
      return;
    }
    setIsTranscribingAudio(true);
    try {
      const refinedText = await transcribeSpokenAudio(audioBlob, current?.text || "");
      if (refinedText) {
        setAnswer(refinedText);
        toast.success("AI Transcribed audio with technical accuracy!");
      } else {
        toast.info("Add a free Gemini key in Setup to enable multimodal AI transcription.");
      }
    } catch (err) {
      toast.error("AI Transcription notice: " + err.message);
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  // Restore active interview session if candidate refreshes the page
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.stage === "running" && Array.isArray(saved.questions) && saved.questions.length > 0) {
          setQuestions(saved.questions);
          setIndex(saved.index || 0);
          setAnswers(saved.answers || []);
          setType(saved.type || "TECHNICAL");
          setDifficulty(saved.difficulty || "MEDIUM");
          setCount(saved.count || saved.questions.length);
          setFocusTopic(saved.focusTopic || "ALL");
          setCustomTopic(saved.customTopic || "");
          setEnableCamera(saved.enableCamera ?? true);
          setStage("running");
          if (saved.enableCamera) {
            startStream().catch(() => { });
          }
          toast.info(`Resumed your active interview at question ${(saved.index || 0) + 1}`);
        }
      }
    } catch (err) {
      console.warn("Could not restore session:", err);
    }
  }, []);

  // Save active interview progress to sessionStorage
  useEffect(() => {
    if (stage === "running" && questions.length > 0) {
      try {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            stage: "running",
            questions,
            index,
            answers,
            type,
            difficulty,
            count,
            focusTopic,
            customTopic,
            enableCamera,
          })
        );
      } catch (e) {
        console.warn("Could not save interview session:", e);
      }
    } else if (stage === "result" || stage === "setup") {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch { }
    }
  }, [stage, questions, index, answers, type, difficulty, count, focusTopic, customTopic, enableCamera]);

  useEffect(() => {
    if (user) {
      setHistory(listInterviews(user.id));
      fetchUserInterviews().then((items) => {
        if (items && items.length > 0) {
          setHistory(items);
        }
      });
    }
  }, [user, stage]);

  // Clean up media, audio recorder, and speech on stage change
  useEffect(() => {
    if (stage !== "running") {
      stopStream();
      stopSpeaking();
      stopListening();
      stopRecording();
    }
  }, [stage, stopStream, stopListening, stopRecording]);

  const handleQuitInterview = () => {
    if (window.confirm("Are you sure you want to end this interview? Progress for this session will be cleared.")) {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch { }
      setStage("setup");
      setQuestions([]);
      setAnswers([]);
      setIndex(0);
      setAnswer("");
      stopStream();
      stopSpeaking();
      stopListening();
      stopRecording();
      toast.info("Interview session ended.");
    }
  };

  const current = questions[index];
  const progress = questions.length ? Math.round((index / questions.length) * 100) : 0;

  const handleStart = async () => {
    if (!user) return;
    setBusy(true);
    try {
      if (enableCamera) {
        await startStream();
      }

      const generated = await generateAiQuestions({
        type,
        difficulty,
        count,
        skills: user.skills || [],
        targetRole: user.targetRole || "Software Engineer",
        resumeText: user.resumeText || "",
        focusTopic,
        customTopic,
      });

      if (!generated || generated.length === 0) {
        toast.error("Could not generate questions. Please try again.");
        return;
      }

      setQuestions(generated);
      setAnswers([]);
      setIndex(0);
      setAnswer("");
      resetTranscript();
      resetRecording();
      setStage("running");

      // Speak the first question aloud automatically
      setTimeout(() => {
        setIsSpeakingQuestion(true);
        speakQuestion(generated[0].text, () => setIsSpeakingQuestion(false));
      }, 500);
    } catch (err) {
      toast.error("Error starting interview: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVoice = async () => {
    if (isListening || isRecording) {
      stopListening();
      stopRecording();
    } else {
      if (isSpeechSupported) {
        startListening();
      }
      await startRecording();
      toast.info("Microphone active. Speak your answer clearly.");
    }
  };

  const handleSpeakQuestion = () => {
    if (!current) return;
    if (isSpeakingQuestion) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
    } else {
      setIsSpeakingQuestion(true);
      speakQuestion(current.text, () => setIsSpeakingQuestion(false));
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user || !current) return;
    stopListening();
    stopRecording();
    stopSpeaking();
    setIsSpeakingQuestion(false);
    setBusy(true);

    try {
      // Evaluate answer with AI (multimodal audio + text)
      const feedback = await evaluateAiAnswer(current, answer, user.skills || [], audioBlob);

      const finalRecordedAnswer = (feedback?.transcript && feedback.transcript.length > answer.length)
        ? feedback.transcript
        : (answer.trim() || "(No response recorded)");

      const entry = {
        questionId: current.id,
        question: current.text,
        skill: current.skill,
        answer: finalRecordedAnswer,
        feedback,
      };

      const nextAnswers = [...answers, entry];
      setAnswers(nextAnswers);
      setAnswer("");
      resetTranscript();
      resetRecording();

      if (index + 1 < questions.length) {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        // Automatically speak next question
        setTimeout(() => {
          setIsSpeakingQuestion(true);
          speakQuestion(questions[nextIndex].text, () => setIsSpeakingQuestion(false));
        }, 500);
      } else {
        // Finalize interview
        const saved = await saveInterview({
          userId: user.id,
          type,
          difficulty,
          totalQuestions: questions.length,
          answers: nextAnswers,
        });
        setResult(saved);
        stopStream();
        setStage("result");
      }
    } catch (err) {
      toast.error("Evaluation error: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  // ================= STAGE 2: LIVE RUNNING INTERVIEW =================
  if (stage === "running" && !current) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-semibold">Session Interrupted</h3>
        <p className="text-sm text-muted-foreground">
          The active question was not found. Click below to start fresh.
        </p>
        <Button onClick={handleQuitInterview}>Reset & Start Session</Button>
      </div>
    );
  }

  if (stage === "running" && current) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-red-500 animate-ping" />
              <Badge variant="destructive" className="text-xs font-mono uppercase tracking-wider">
                Live Mock Interview
              </Badge>
              <Badge variant="outline">{type} Round</Badge>
              {type === "TECHNICAL" && focusTopic !== "ALL" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {focusTopic === "CUSTOM" && customTopic ? customTopic : INTERVIEW_TOPICS[focusTopic]?.label || focusTopic}
                </Badge>
              )}
              <Badge variant="secondary">{difficulty.toLowerCase()}</Badge>
            </div>
            <h2 className="text-xl font-bold mt-1">
              Question {index + 1} of {questions.length}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-44">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuitInterview}
              className="text-xs h-8 text-muted-foreground hover:text-destructive hover:border-destructive"
            >
              Quit Session
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          {/* LEFT: LIVE WEBCAM & AI INTERVIEWER */}
          <div className="space-y-4">
            {/* Webcam feed */}
            <Card className="overflow-hidden bg-black/90 border-2 border-primary/20 shadow-lg relative">
              <div className="relative aspect-video w-full flex items-center justify-center bg-slate-950">
                {enableCamera && isCameraOn && !mediaError ? (
                  <video
                    ref={attachVideo}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : mediaError ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-red-950/60 border border-red-500/40 rounded-lg text-white max-w-sm m-auto z-10">
                    <CircleAlert className="size-10 text-red-400 mb-2" />
                    <p className="text-sm font-semibold text-red-200">Camera Notice</p>
                    <p className="text-xs text-red-300/90 mt-1.5 leading-relaxed">{mediaError}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 text-xs border-red-500/50 hover:bg-red-900/40 text-red-100"
                      onClick={() => startStream()}
                    >
                      <RotateCcw className="size-3.5 mr-1.5" />
                      Retry Camera
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <CameraOff className="size-12 mb-2 opacity-50 text-white" />
                    <p className="text-sm font-medium text-white">Camera is turned off</p>
                    <p className="text-xs text-slate-400 mt-1">Click the camera button below to turn it on</p>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-white">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-semibold tracking-wide">REC</span>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                  <UserIcon className="size-3.5 text-primary" />
                  <span>{user?.name || "Candidate"}</span>
                </div>

                {/* Video controls */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${isCameraOn ? "bg-black/60 text-white hover:bg-black/80" : "bg-red-600 text-white"
                      }`}
                    title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                  >
                    {isCameraOn ? <Camera className="size-4" /> : <CameraOff className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${isMicOn ? "bg-black/60 text-white hover:bg-black/80" : "bg-red-600 text-white"
                      }`}
                    title={isMicOn ? "Mute mic" : "Unmute mic"}
                  >
                    {isMicOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                  </button>
                </div>
              </div>
            </Card>

            {/* AI Interviewer Audio Card */}
            <Card className="border-border/80 bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">AI Interviewer</h4>
                    <p className="text-xs text-muted-foreground">
                      {isSpeakingQuestion ? "Speaking question…" : "Listen or replay the question"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isSpeakingQuestion ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleSpeakQuestion}
                  className="gap-1.5"
                >
                  {isSpeakingQuestion ? (
                    <>
                      <VolumeX className="size-4" /> Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-4" /> Speak Question
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT: QUESTION & VOICE-TO-TEXT ANSWER */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-medium">
                    {current.skill}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {current.id}
                  </span>
                </div>
                <CardTitle className="mt-2 text-xl font-display leading-snug">
                  {current.text}
                </CardTitle>
                <CardDescription>
                  Speak your answer clearly using the microphone button, or type in the box below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voice recording button & Live status */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleToggleVoice}
                      variant={isListening || isRecording ? "destructive" : "default"}
                      size="sm"
                      className={`gap-2 ${isListening || isRecording ? "animate-pulse shadow-md shadow-destructive/20" : ""
                        }`}
                    >
                      {isListening || isRecording ? (
                        <>
                          <MicOff className="size-4" /> Stop Speaking
                        </>
                      ) : (
                        <>
                          <Mic className="size-4" /> Speak Answer (Mic)
                        </>
                      )}
                    </Button>

                    {/* Accent / Language toggle */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguage(selectedLang === "en-IN" ? "en-US" : "en-IN")}
                      className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                      title="Click to switch speech accent between Indian English and US English"
                    >
                      {selectedLang === "en-IN" ? "🇮🇳 English (IN)" : "🇺🇸 English (US)"}
                    </Button>

                    {/* AI Transcribe Button (when audio was recorded) */}
                    {audioBlob && !isListening && !isRecording && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAiTranscribe}
                        disabled={isTranscribingAudio}
                        className="text-xs h-8 gap-1.5 font-medium border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                        title="Transcribe recorded audio directly with Google Gemini AI for technical terminology"
                      >
                        {isTranscribingAudio ? (
                          <>
                            <Loader2 className="size-3 animate-spin" /> Transcribing…
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3 text-primary" /> AI Refine Text
                          </>
                        )}
                      </Button>
                    )}

                    {(isListening || isRecording) && (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20">
                        <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                          <span className="size-2 rounded-full bg-destructive animate-ping" />
                          Listening…
                        </span>
                        {/* Dynamic audio equalizer visualizer bars */}
                        <div
                          className="flex items-end gap-0.5 h-4 px-1"
                          title={`Mic input level: ${audioLevel}%`}
                        >
                          <span
                            className="w-1 bg-destructive rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (audioLevel * 0.9) % 16 + 4)}px` }}
                          />
                          <span
                            className="w-1 bg-destructive rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (audioLevel * 1.3) % 16 + 4)}px` }}
                          />
                          <span
                            className="w-1 bg-destructive rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (audioLevel * 1.5) % 16 + 4)}px` }}
                          />
                          <span
                            className="w-1 bg-destructive rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (audioLevel * 1.1) % 16 + 4)}px` }}
                          />
                          <span
                            className="w-1 bg-destructive rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (audioLevel * 0.7) % 16 + 4)}px` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-destructive/80">
                          {audioLevel > 5 ? "Audio detected" : "Mic ready"}
                        </span>
                      </div>
                    )}
                  </div>
                  {answer && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setAnswer("");
                        resetTranscript();
                        resetRecording();
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="mr-1 size-3" /> Clear text
                    </Button>
                  )}
                </div>

                {/* Answer Textarea */}
                <div className="space-y-1.5">
                  <Label htmlFor="answer" className="text-xs font-medium text-muted-foreground">
                    Your Response:
                  </Label>
                  <Textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={7}
                    placeholder="Speak your response using the microphone above, or type it here. Include key concepts, definitions, and real-world examples."
                    className="font-normal leading-relaxed text-sm resize-y"
                  />
                </div>

                {/* Submission Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleSubmitAnswer}
                    disabled={busy}
                    className="text-muted-foreground"
                  >
                    Skip Question
                  </Button>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={busy}
                    size="lg"
                    className="gap-2 font-medium"
                  >
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    {index + 1 === questions.length ? "Finish & Evaluate" : "Submit Answer & Next"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ================= STAGE 3: INTERVIEW RESULTS & FEEDBACK =================
  if (stage === "result" && result) {
    return (
      <div className="space-y-6">
        <PageHeader title="Interview Result & AI Analysis" subtitle={result.summary} />

        <div className="grid gap-4 sm:grid-cols-3">
          <ScoreCard label="Overall Score" value={`${result.score}/10`} />
          <ScoreCard label="Questions Attempted" value={`${result.attempted}/${result.totalQuestions}`} />
          <ScoreCard label="Interview Round" value={result.type === "HR" ? "HR Round" : "Technical Round"} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                <CheckCircle2 className="size-5" /> Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                {result.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                <CircleAlert className="size-5" /> Concepts to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                {result.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed per-question feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Question-by-Question Evaluation</CardTitle>
            <CardDescription>
              Review your spoken answer, examiner score, and the model answer for each question.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.answers.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="mb-1 text-xs">
                      {item.skill}
                    </Badge>
                    <h4 className="font-semibold text-base">{item.question}</h4>
                  </div>
                  <span className="font-display text-xl font-bold text-primary">
                    {item.feedback?.score ?? 0}/10
                  </span>
                </div>

                <div className="rounded-md bg-muted/40 p-3 text-sm">
                  <span className="font-medium text-xs uppercase text-muted-foreground block mb-1">
                    Your Spoken Answer:
                  </span>
                  <p className="whitespace-pre-wrap text-muted-foreground">{item.answer}</p>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-xs uppercase text-primary block mb-0.5">
                    Examiner Feedback:
                  </span>
                  <p className="text-foreground">{item.feedback?.comment}</p>
                </div>

                {item.feedback?.modelAnswer && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                    <span className="font-medium text-xs uppercase text-primary flex items-center gap-1 mb-1">
                      <BookOpen className="size-3.5" /> Model Answer:
                    </span>
                    <p className="text-foreground/90 leading-relaxed">{item.feedback.modelAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setStage("setup")} size="lg">
            Start Another Interview
          </Button>
        </div>
      </div>
    );
  }

  // ================= STAGE 1: SETUP INTERVIEW =================
  return (
    <>
      <PageHeader
        title="Live Mock Interview"
        subtitle="AI-driven mock rounds with webcam preview, voice speech recognition, and instant placement evaluation."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Set Up Your Session</CardTitle>
            <CardDescription>
              Around 2-3 minutes per question with live webcam and speech transcription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Round Type</Label>
                <Select value={type} onValueChange={(val) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical Round</SelectItem>
                    <SelectItem value="HR">HR Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(val) => setDifficulty(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy (Campus Fresher)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (Standard)</SelectItem>
                    <SelectItem value="HARD">Hard (Product Companies)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Technical Focus Topic / Track Selector */}
            {type === "TECHNICAL" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Interview Focus Topic</Label>
                  <span className="text-[11px] text-muted-foreground">Select a specific subject or drill</span>
                </div>
                <Select value={focusTopic} onValueChange={(val) => setFocusTopic(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">🌐 Full Technical (All Resume Skills & Projects)</SelectItem>
                    <SelectItem value="JAVA">☕ Java & Spring Boot (OOP, JVM, Collections)</SelectItem>
                    <SelectItem value="FRONTEND">🎨 Frontend (React, JS, HTML/CSS)</SelectItem>
                    <SelectItem value="BACKEND">⚙️ Backend & REST APIs (Spring, Node, Microservices)</SelectItem>
                    <SelectItem value="MYSQL">🗄️ MySQL & Databases (SQL Queries, ACID, Joins)</SelectItem>
                    <SelectItem value="DSA">🧩 Data Structures & Algorithms</SelectItem>
                    <SelectItem value="ENTC">⚡ ENTC / Embedded Systems & IoT (C, Protocols, Microcontrollers)</SelectItem>
                    <SelectItem value="PYTHON">🐍 Python & AI / Machine Learning</SelectItem>
                    <SelectItem value="CUSTOM">✏️ Custom Topic (Enter your own)</SelectItem>
                  </SelectContent>
                </Select>

                {focusTopic === "CUSTOM" && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in-50">
                    <Input
                      placeholder="e.g. Microcontrollers & VLSI, Docker & Kubernetes, Spring Security"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Gemini will craft deep technical questions specifically for this chosen technology.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Select value={String(count)} onValueChange={(val) => setCount(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 questions (~8 mins)</SelectItem>
                  <SelectItem value="5">5 questions (~15 mins)</SelectItem>
                  <SelectItem value="8">8 questions (~25 mins)</SelectItem>
                  <SelectItem value="10">10 questions (~30 mins)</SelectItem>
                  <SelectItem value="15">15 questions (~45 mins)</SelectItem>
                  <SelectItem value="20">20 questions (~60 mins)</SelectItem>
                  <SelectItem value="25">25 questions (~75 mins)</SelectItem>
                  <SelectItem value="30">30 questions (Comprehensive)</SelectItem>
                  <SelectItem value="40">40 questions (Marathon)</SelectItem>
                  <SelectItem value="50">50 questions (Full Assessment)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live Camera & Mic Toggle */}
            <div className="rounded-lg border border-border p-4 bg-secondary/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Camera className="size-4 text-primary" />
                  <span className="font-medium text-sm">Live Camera & Microphone</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Simulates a real video interview experience.
                </p>
              </div>
              <input
                type="checkbox"
                checked={enableCamera}
                onChange={(e) => setEnableCamera(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <Button onClick={handleStart} disabled={busy} size="lg" className="w-full gap-2 font-semibold">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Start Live Interview
            </Button>
          </CardContent>
        </Card>

        {/* PAST SESSIONS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview History</CardTitle>
            <CardDescription>Your completed mock interviews and readiness progress.</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-2">
                <Bot className="mx-auto size-8 opacity-40" />
                <p className="text-sm">No interviews completed yet.</p>
                <p className="text-xs">Your first live interview will appear here once submitted.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {history.slice(0, 6).map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.difficulty.toLowerCase()} · {item.attempted}/{item.totalQuestions} questions
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="font-display text-lg font-bold text-primary">
                      {item.score}/10
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ScoreCard({ label, value }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
