//app/Ai-Applicant-Filter/screens/AssessmentScreen.jsx
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
  Lightbulb,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Save, // New Icon
} from "lucide-react";

// --- CUSTOM CSS ---
const styles = `
  .mic-wave { display: flex; align-items: center; justify-content: center; gap: 4px; height: 30px; }
  .bar { width: 4px; background: #06b6d4; animation: wave 1s ease-in-out infinite; }
  .bar:nth-child(odd) { animation-duration: 0.8s; }
  .bar:nth-child(2n) { animation-duration: 1.1s; }
  .bar:nth-child(3n) { animation-duration: 1.3s; }
  @keyframes wave { 0%, 100% { height: 10px; } 50% { height: 25px; } }
`;

const PREDEFINED_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Spring Boot",
  "Machine Learning",
  "AWS",
  "UI/UX Design",
  "Cybersecurity",
];

const CONFIDENCE_SCENARIOS = [
  "You realize you pushed a critical bug to production on a Friday evening. What is your immediate reaction?",
  "A senior developer strongly disagrees with your solution, but you are sure you are correct. How do you handle it?",
  "You are given a task with a deadline of tomorrow using a tech stack you don't know. What do you do?",
];

export default function AssessmentScreen() {
  // --- STATE ---
  const [view, setView] = useState("menu");

  // Selection
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Quiz
  const [quizData, setQuizData] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Confidence
  const [confIndex, setConfIndex] = useState(0);
  const [confScore, setConfScore] = useState(0); // Cumulative score
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'

  const recognitionRef = useRef(null);

  // --- SPEECH SETUP ---
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

  // --- API FUNCTIONS ---

  // 1. GENERATE QUIZ (Connected to Backend)
  const handleGenerateQuiz = async () => {
    const finalTopicList = [...selectedSkills];
    if (customTopic.trim()) finalTopicList.push(customTopic.trim());

    if (finalTopicList.length === 0) return alert("Please select a skill.");

    setIsGeneratingQuiz(true);

    try {
      const response = await fetch("http://localhost:5000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: finalTopicList }),
      });

      const data = await response.json();

      if (data.questions) {
        setQuizData(data.questions);
        setView("quiz");
      } else {
        alert("Failed to generate questions. Try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Could not connect to server. Ensure backend is running.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // 2. ANALYZE CONFIDENCE (Connected to Backend)
  const handleAnalyzeResponse = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze-confidence",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: CONFIDENCE_SCENARIOS[confIndex],
            answer: transcript,
          }),
        }
      );

      const data = await response.json();
      const score = data.score || 70; // Fallback if AI fails

      setConfScore((prev) => prev + score);

      // Move to next or finish
      if (confIndex < CONFIDENCE_SCENARIOS.length - 1) {
        setConfIndex((prev) => prev + 1);
        setTranscript("");
      } else {
        setView("final_results");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Error analyzing response.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. SAVE TO MONGODB (New Function)
  const handleSaveResult = async () => {
    setIsSaving(true);

    // Calculate final stats
    const finalQuizScore =
      isQuizCompleted && quizData.length > 0
        ? (quizScore / quizData.length) * 100
        : 0;
    const finalConfScore = Math.round(confScore / CONFIDENCE_SCENARIOS.length);

    try {
      const response = await fetch("http://localhost:5000/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: "Current User", // You can replace this with dynamic user data
          skillsSelected: [...selectedSkills, customTopic].filter(Boolean),
          quizScore: finalQuizScore,
          confidenceScore: finalConfScore,
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- HELPERS ---
  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleQuizAnswer = (optionIndex) => {
    const currentQuestion = quizData[currentQuizIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;

    setAnswerStatus(isCorrect ? "correct" : "wrong");
    if (isCorrect) setQuizScore((prev) => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setAnswerStatus(null);
      setShowExplanation(false);
    } else {
      setIsQuizCompleted(true);
      setView("quiz_summary");
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current)
      return alert("Speech recognition not supported.");
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // --- RENDER VIEWS ---

  const renderNavbar = () => (
    <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setView("menu")}
          >
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Career Guide
            </span>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderSelectionMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
        Select Assessment Mode
      </h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mt-12">
        {/* Quiz Card */}
        <div
          onClick={() => !isQuizCompleted && setView("topic_selection")}
          className={`group bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl transition-all border 
            ${
              isQuizCompleted
                ? "border-green-500/50 bg-green-900/10 cursor-default"
                : "border-purple-500/30 hover:border-purple-500 cursor-pointer hover:bg-white/10"
            }`}
        >
          <div className="flex justify-between items-start">
            <FileText
              className={`w-12 h-12 mb-4 ${
                isQuizCompleted ? "text-green-400" : "text-purple-400"
              }`}
            />
            {isQuizCompleted && (
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">1. Rapid Quiz</h2>
          <p className="text-gray-400">
            {isQuizCompleted
              ? "Completed! Proceed to Confidence Check."
              : "Generate technical questions based on specific skills."}
          </p>
        </div>

        {/* Confidence Card */}
        <div
          onClick={() => setView("confidence_intro")}
          className="group bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all border border-cyan-500/30 hover:border-cyan-500"
        >
          <Activity className="w-12 h-12 text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            2. Confidence Check
          </h2>
          <p className="text-gray-400">
            Voice-based scenario analysis and confidence scoring.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTopicSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Select Your Skills
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {PREDEFINED_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {skill}
                {isSelected && <CheckCircle2 className="w-4 h-4 ml-2" />}
              </button>
            );
          })}
        </div>
        <div className="border-t border-white/10 pt-6">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white mb-6 focus:border-purple-500 outline-none"
            placeholder="Ex: Rust, Go..."
          />
        </div>
        <button
          onClick={handleGenerateQuiz}
          disabled={isGeneratingQuiz}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 transition-all"
        >
          {isGeneratingQuiz ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Generating with AI...
            </>
          ) : (
            "Generate 5 Questions"
          )}
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!quizData || quizData.length === 0)
      return <div>Error loading quiz.</div>;
    const question = quizData[currentQuizIndex];
    const hasAnswered = answerStatus !== null;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <span className="text-purple-400 font-semibold">
              Question {currentQuizIndex + 1}/{quizData.length}
            </span>
            <button
              onClick={() =>
                hasAnswered && setShowExplanation(!showExplanation)
              }
              className={`p-2 rounded-full transition duration-300 ${
                hasAnswered
                  ? "hover:bg-white/10 text-yellow-400"
                  : "text-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              <Lightbulb
                className={`w-6 h-6 ${showExplanation ? "fill-current" : ""}`}
              />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-8">
            {question.question}
          </h2>

          <div className="space-y-4 mb-8">
            {question.options.map((option, idx) => {
              let btnClass =
                "bg-white/5 border-white/10 hover:bg-purple-500/20";
              if (hasAnswered) {
                if (idx === question.correctAnswerIndex)
                  btnClass = "bg-green-500/20 border-green-500 text-green-300";
                else if (
                  idx !== question.correctAnswerIndex &&
                  answerStatus === "wrong"
                )
                  btnClass = "opacity-50";
              }
              return (
                <button
                  key={idx}
                  onClick={() => !hasAnswered && handleQuizAnswer(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-xl border text-gray-200 transition-all ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-200 text-sm">
                <span className="font-bold">Explanation:</span>{" "}
                {question.explanation}
              </p>
            </div>
          )}

          {hasAnswered && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-white text-purple-900 font-bold rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                {currentQuizIndex < quizData.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizSummary = () => {
    const scorePercentage = (quizScore / quizData.length) * 100;
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in zoom-in">
        <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 text-center">
          <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Quiz Completed!
          </h2>
          <div className="text-4xl font-bold text-white mt-4 mb-8">
            {Math.round(scorePercentage)}%
          </div>
          <button
            onClick={() => setView("menu")}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    );
  };

  const renderConfidenceIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">
        Phase 2: Confidence Check
      </h2>
      <p className="text-gray-400 max-w-lg mb-8">
        You will now face {CONFIDENCE_SCENARIOS.length} sudden scenarios.
      </p>
      <button
        onClick={() => setView("confidence")}
        className="bg-cyan-500 px-8 py-3 rounded-full text-white font-bold hover:bg-cyan-400"
      >
        Start
      </button>
    </div>
  );

  const renderConfidenceCheck = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-1 bg-cyan-500"
          style={{
            width: `${((confIndex + 1) / CONFIDENCE_SCENARIOS.length) * 100}%`,
          }}
        ></div>

        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-semibold mb-4">
            Scenario {confIndex + 1}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
            "{CONFIDENCE_SCENARIOS[confIndex]}"
          </h2>
        </div>

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

          <div className="w-full bg-black/30 rounded-xl p-4 min-h-[100px] border border-white/5">
            {isRecording && (
              <div className="mic-wave mb-2">
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            )}
            <p className="text-gray-300 text-center italic">
              {transcript ||
                (isProcessing
                  ? "AI is analyzing your confidence..."
                  : "Your answer will appear here...")}
            </p>
          </div>

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

  const renderFinalResults = () => {
    const finalQuizScore =
      isQuizCompleted && quizData.length > 0
        ? (quizScore / quizData.length) * 100
        : 0;
    const finalConfScore = Math.round(confScore / CONFIDENCE_SCENARIOS.length);
    const totalScore = Math.round((finalQuizScore + finalConfScore) / 2);

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in zoom-in duration-500">
        <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Assessment Complete!
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-8 mt-8">
            <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30">
              <span className="block text-purple-300 text-sm mb-1">Quiz</span>
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
              <span className="block text-gray-300 text-sm mb-1">Rank</span>
              <span className="block text-3xl font-bold text-green-400">
                {totalScore > 80 ? "A" : totalScore > 60 ? "B" : "C"}
              </span>
            </div>
          </div>

          {/* SAVE BUTTON SECTION */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition"
            >
              Start New
            </button>

            <button
              onClick={handleSaveResult}
              disabled={isSaving || saveStatus === "success"}
              className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg 
                  ${
                    saveStatus === "success"
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/25"
                  }`}
            >
              {isSaving ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : saveStatus === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}

              {isSaving
                ? "Saving..."
                : saveStatus === "success"
                ? "Saved to DB"
                : "Save Results"}
            </button>
          </div>

          {saveStatus === "error" && (
            <p className="text-red-400 mt-4 text-sm">
              Failed to save results. Check backend connection.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-10">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>
        {renderNavbar()}
        <main className="pt-20">
          {view === "menu" && renderSelectionMenu()}
          {view === "topic_selection" && renderTopicSelection()}
          {view === "quiz" && renderQuiz()}
          {view === "quiz_summary" && renderQuizSummary()}
          {view === "confidence_intro" && renderConfidenceIntro()}
          {view === "confidence" && renderConfidenceCheck()}
          {view === "final_results" && renderFinalResults()}
        </main>
      </div>
    </>
  );
}
