import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Mic,
  MicOff,
  ChevronRight,
  Trophy,
  RefreshCw,
  FileText,
  Activity,
  User,
  Menu,
  X,
  Home,
} from "lucide-react";

// --- CUSTOM CSS VARIABLES (Embedded for self-containment) ---
// These override/supplement your global theme for this specific interactive component
const styles = `
  .mic-wave {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 30px;
  }

  .bar {
    width: 4px;
    background: #06b6d4;
    animation: wave 1s ease-in-out infinite;
  }

  .bar:nth-child(odd) { animation-duration: 0.8s; }
  .bar:nth-child(2n) { animation-duration: 1.1s; }
  .bar:nth-child(3n) { animation-duration: 1.3s; }

  @keyframes wave {
    0%, 100% { height: 10px; }
    50% { height: 25px; }
  }
`;

// --- MOCK DATA FOR QUIZ ---
const MOCK_QUIZ_DATA = [
  {
    id: 1,
    question:
      "Which data structure is best for a LIFO (Last In, First Out) requirement?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correct: 1,
  },
  {
    id: 2,
    question: "In Python, what is the output of print(2 ** 3)?",
    options: ["6", "8", "9", "Error"],
    correct: 1,
  },
  {
    id: 3,
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Question Language",
      "System Query Logic",
      "Standard Query Loop",
    ],
    correct: 0,
  },
];

// --- SCENARIOS FOR CONFIDENCE CHECK ---
const CONFIDENCE_SCENARIOS = [
  "You realize you pushed a critical bug to production on a Friday evening, and clients are complaining. What is your immediate reaction?",
  "A senior developer strongly disagrees with your solution in a meeting, but you are 100% sure you are correct. How do you handle it?",
  "You are given a task with a deadline of tomorrow, but you don't know the technology stack at all. What do you do?",
];

export default function AssessmentScreen() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState("menu"); // menu, quiz, confidence, results
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Confidence State
  const [confIndex, setConfIndex] = useState(0);
  const [confScore, setConfScore] = useState(0); // Cumulative score
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // --- CONFIDENCE CHECK LOGIC (Web Speech API) ---
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(
              (prev) => prev + " " + event.results[i][0].transcript
            );
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      handleAnalyzeResponse();
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleAnalyzeResponse = () => {
    setIsProcessing(true);
    // SIMULATION: In a real app, send 'transcript' to LLM API here.
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Random score 60-100
      setConfScore((prev) => prev + mockScore);
      setIsProcessing(false);

      if (confIndex < CONFIDENCE_SCENARIOS.length - 1) {
        setConfIndex((prev) => prev + 1);
        setTranscript("");
      } else {
        setView("results");
      }
    }, 2000);
  };

  // --- QUIZ LOGIC ---
  const handleQuizAnswer = (optionIndex) => {
    const isCorrect = optionIndex === MOCK_QUIZ_DATA[currentQuizIndex].correct;
    if (isCorrect) setQuizScore((prev) => prev + 1);

    if (currentQuizIndex < MOCK_QUIZ_DATA.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setView("results");
    }
  };

  // --- RENDER HELPERS ---
  const renderNavbar = () => (
    <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Career Guide
            </span>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-gray-300 hover:text-purple-400 cursor-pointer flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Home
            </a>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );

  const renderSelectionMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
        Select Assessment Mode
      </h1>
      <p className="text-gray-400 mb-12 text-center max-w-2xl">
        Choose a module to evaluate your readiness. The{" "}
        <span className="text-purple-400">Rapid Quiz</span> tests technical
        knowledge, while <span className="text-cyan-400">Confidence Check</span>{" "}
        evaluates soft skills.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Option 1: Rapid Quiz */}
        <div
          onClick={() => setView("quiz")}
          className="group bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] border border-purple-500/30 hover:border-purple-500"
        >
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">1. Rapid Quiz</h2>
          <p className="text-gray-400 mb-4">
            AI-generated technical questions based on your target job
            description dataset.
          </p>
          <div className="flex items-center text-purple-400 font-semibold">
            Start Quiz <ChevronRight className="w-5 h-5 ml-1" />
          </div>
        </div>

        {/* Option 2: Confidence Check */}
        <div
          onClick={() => setView("confidence")}
          className="group bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] border border-cyan-500/30 hover:border-cyan-500"
        >
          <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            2. Confidence Check
          </h2>
          <p className="text-gray-400 mb-4">
            Voice-based scenario analysis. Handle pressure situations and get an
            AI confidence score.
          </p>
          <div className="flex items-center text-cyan-400 font-semibold">
            Start Check <ChevronRight className="w-5 h-5 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const question = MOCK_QUIZ_DATA[currentQuizIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <span className="text-purple-400 font-semibold">
              Question {currentQuizIndex + 1}/{MOCK_QUIZ_DATA.length}
            </span>
            <span className="text-gray-400 text-sm">Technical Assessment</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(idx)}
                className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-purple-500/20 hover:border-purple-500 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderConfidenceCheck = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 relative overflow-hidden">
        {/* Progress Bar */}
        <div
          className="absolute top-0 left-0 h-1 bg-cyan-500"
          style={{
            width: `${((confIndex + 1) / CONFIDENCE_SCENARIOS.length) * 100}%`,
          }}
        ></div>

        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-semibold mb-4">
            Scenario {confIndex + 1} of {CONFIDENCE_SCENARIOS.length}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
            "{CONFIDENCE_SCENARIOS[confIndex]}"
          </h2>
          <p className="text-gray-400">
            Press the microphone and explain how you would handle this.
          </p>
        </div>

        {/* Microphone Interaction */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {!isProcessing ? (
            <button
              onClick={toggleRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isRecording
                  ? "bg-red-500 shadow-red-500/50 scale-110 animate-pulse"
                  : "bg-cyan-500 shadow-cyan-500/50 hover:bg-cyan-400"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center animate-spin">
              <RefreshCw className="w-8 h-8 text-cyan-400" />
            </div>
          )}

          {/* Transcript Display */}
          <div className="w-full bg-black/30 rounded-xl p-4 min-h-[100px] border border-white/5">
            {isRecording ? (
              <div className="mic-wave mb-2">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            ) : null}
            <p className="text-gray-300 text-center italic">
              {transcript ||
                (isProcessing
                  ? "AI is analyzing your confidence levels..."
                  : "Your answer will appear here...")}
            </p>
          </div>

          {/* Action Button */}
          {transcript && !isRecording && !isProcessing && (
            <button
              onClick={handleAnalyzeResponse}
              className="bg-white text-cyan-600 px-8 py-3 rounded-full font-bold hover:bg-cyan-50 transition"
            >
              Analyze Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    // Normalize scores
    const finalQuizScore = (quizScore / MOCK_QUIZ_DATA.length) * 100;
    const finalConfScore = Math.round(confScore / CONFIDENCE_SCENARIOS.length);
    const totalScore = Math.round((finalQuizScore + finalConfScore) / 2);

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in zoom-in duration-500">
        <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center relative overflow-hidden">
          {/* Confetti or Gradient Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>

          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />

          <h2 className="text-3xl font-bold text-white mb-2">
            Assessment Complete!
          </h2>
          <p className="text-gray-400 mb-8">
            Here is your comprehensive performance breakdown.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30">
              <span className="block text-purple-300 text-sm mb-1">
                Technical Quiz
              </span>
              <span className="block text-3xl font-bold text-white">
                {Math.round(finalQuizScore)}%
              </span>
            </div>
            <div className="p-4 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
              <span className="block text-cyan-300 text-sm mb-1">
                Confidence
              </span>
              <span className="block text-3xl font-bold text-white">
                {finalConfScore}%
              </span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
              <span className="block text-gray-300 text-sm mb-1">
                Overall Rank
              </span>
              <span className="block text-3xl font-bold text-green-400">
                {totalScore > 80 ? "A" : totalScore > 60 ? "B" : "C"}
              </span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl mb-8 text-left">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" /> Candidate Profile
            </h4>
            <div className="text-sm text-gray-400 space-y-1">
              <p>
                Name: <span className="text-white">John Doe</span>
              </p>
              <p>
                ID: <span className="text-white">AID-2025-X99</span>
              </p>
              <p>
                Status:{" "}
                <span className="text-green-400">Ready for Interview</span>
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setView("menu");
                setQuizScore(0);
                setConfScore(0);
                setCurrentQuizIndex(0);
                setConfIndex(0);
              }}
              className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition"
            >
              Back to Menu
            </button>
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition">
              Save Results
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-10">
        {/* Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>

        {renderNavbar()}
        <main className="pt-20">
          {view === "menu" && renderSelectionMenu()}
          {view === "quiz" && renderQuiz()}
          {view === "confidence" && renderConfidenceCheck()}
          {view === "results" && renderResults()}
        </main>
      </div>
    </>
  );
}
