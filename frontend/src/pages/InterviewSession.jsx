import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { submitAnswer, completeInterview, getInterviewSession } from '../services/api';

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const [questions, setQuestions] = useState(location.state?.questions || null);
  const [interviewType, setInterviewType] = useState(location.state?.interviewType || '');
  const [jobRole, setJobRole] = useState(location.state?.jobRole || '');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || '');
  const [interviewId, setInterviewId] = useState(location.state?.interviewId || paramId);

  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState([]);
  const [speechAnalyses, setSpeechAnalyses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [questionTimers, setQuestionTimers] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loadingSession, setLoadingSession] = useState(!location.state?.questions);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const timerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // If navigated from Dashboard history (no state), load session from API
  useEffect(() => {
    if (!location.state?.questions && paramId) {
      loadExistingSession(paramId);
    }
  }, [paramId]);

  const loadExistingSession = async (sessionId) => {
    try {
      const res = await getInterviewSession(sessionId);
      const data = res.data;
      setQuestions(data.questions);
      setInterviewType(data.interview_type);
      setJobRole(data.job_role);
      setDifficulty(data.difficulty);
      setInterviewId(data.id);

      // Restore previous answers & scores
      const existingAnswers = data.answers || [];
      const existingScores = data.scores || [];
      const existingSpeechAnalyses = data.speech_analyses || [];
      setAnswers(existingAnswers);
      setScores(existingScores);
      setSpeechAnalyses(existingSpeechAnalyses);

      // Jump to first unanswered question
      const firstUnanswered = existingAnswers.findIndex((a) => !a);
      if (firstUnanswered >= 0) {
        setCurrentQ(firstUnanswered);
      }

      // If already completed, redirect to feedback
      if (data.status === 'completed') {
        navigate(`/interview/feedback/${sessionId}`, { replace: true });
        return;
      }

      setLoadingSession(false);
    } catch (err) {
      console.error('Failed to load session:', err);
      navigate('/interview/setup', { replace: true });
    }
  };

  useEffect(() => {
    if (!questions && !loadingSession) {
      navigate('/interview/setup');
    }
  }, [questions, loadingSession, navigate]);

  // Global timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Per-question timer
  useEffect(() => {
    questionTimerRef.current = setInterval(() => {
      setQuestionTimers((prev) => {
        const updated = [...prev];
        updated[currentQ] = (updated[currentQ] || 0) + 1;
        return updated;
      });
    }, 1000);
    return () => clearInterval(questionTimerRef.current);
  }, [currentQ]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setShowScore(false);

    try {
      const res = await submitAnswer({
        interview_id: interviewId,
        question_index: currentQ,
        answer_text: answer.trim(),
        is_voice: false,
      });

      const newAnswers = [...answers];
      newAnswers[currentQ] = answer.trim();
      setAnswers(newAnswers);

      const newScores = [...scores];
      newScores[currentQ] = res.data.score;
      setScores(newScores);

      if (res.data.speech_analysis) {
        const newSpeechAnalyses = [...speechAnalyses];
        newSpeechAnalyses[currentQ] = res.data.speech_analysis;
        setSpeechAnalyses(newSpeechAnalyses);
      }

      setShowScore(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer(answers[currentQ + 1] || '');
      setShowScore(!!scores[currentQ + 1]);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setAnswer(answers[currentQ - 1] || '');
      setShowScore(!!scores[currentQ - 1]);
    }
  };

  const handleSkip = () => {
    setShowSkipModal(false);
    handleNext();
  };

  const handleCompleteClick = () => {
    const unanswered = questions.length - answers.filter(Boolean).length;
    if (unanswered > 0) {
      setShowCompleteModal(true);
    } else {
      doComplete();
    }
  };

  const doComplete = async () => {
    setShowCompleteModal(false);
    setCompleting(true);
    try {
      await completeInterview(interviewId);
      clearInterval(timerRef.current);
      clearInterval(questionTimerRef.current);
      navigate(`/interview/feedback/${interviewId}`);
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      setCompleting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7) return 'score-high';
    if (score >= 5) return 'score-mid';
    return 'score-low';
  };

  const getScoreTextColor = (score) => {
    if (score >= 7) return 'text-success';
    if (score >= 5) return 'text-warning';
    return 'text-danger';
  };

  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  const getWordCountTip = () => {
    if (wordCount === 0) return { text: 'Start typing your answer...', color: 'text-text-muted' };
    if (wordCount < 15) return { text: 'Too brief — try adding more detail and examples', color: 'text-warning' };
    if (wordCount < 30) return { text: 'Decent start — consider elaborating with specific examples', color: 'text-info' };
    if (wordCount < 100) return { text: 'Good length — well-detailed response', color: 'text-success' };
    return { text: 'Getting lengthy — ensure you stay focused on key points', color: 'text-warning' };
  };

  const tip = getWordCountTip();

  // Loading state
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (!questions) return null;

  const answeredCount = answers.filter(Boolean).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen pb-8 sm:pb-12 px-4 sm:px-6 mesh-gradient relative" style={{ paddingTop: 'clamp(80px, 12vw, 100px)' }}>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 animate-fade-in session-header">
          <div>
            <div className="flex gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <span className="tag">{interviewType}</span>
              <span className="tag">{jobRole}</span>
              <span className="tag">{difficulty}</span>
            </div>
            <div className="text-text-muted text-xs sm:text-sm">
              Question {currentQ + 1} of {questions.length} · {answeredCount} answered
            </div>
          </div>
          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
            <div className="text-xl sm:text-2xl font-mono font-bold text-primary">{formatTime(timer)}</div>
            <div className="text-text-muted text-[10px] sm:text-xs">
              Q{currentQ + 1}: {formatTime(questionTimers[currentQ] || 0)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar mb-6 sm:mb-8 animate-fade-in">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-5 sm:p-8 mb-4 sm:mb-6 animate-fade-in shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-base sm:text-lg font-bold shrink-0 shadow-md shadow-primary/15">
              {currentQ + 1}
            </div>
            <div className="min-w-0">
              <div className="text-text-muted text-[10px] sm:text-xs mb-1.5 sm:mb-2 uppercase tracking-wider font-semibold">Question</div>
              <p className="text-base sm:text-lg font-medium leading-relaxed text-text-primary">{questions[currentQ]}</p>
            </div>
          </div>
        </div>

        {/* Answer Area */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in animate-fade-in-delay-1 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs sm:text-sm font-semibold text-text-secondary">Your Answer</span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  isRecording
                    ? 'bg-danger-light border-danger text-danger pulse-recording'
                    : 'bg-surface-lighter border-surface-border text-text-secondary hover:border-primary/50 hover:text-primary'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    Stop
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                    <span className="hidden sm:inline">Voice Input</span>
                    <span className="sm:hidden">Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            id="answer-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here or use voice input..."
            className="input-field !min-h-[120px] sm:!min-h-[160px] resize-y"
            rows={5}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2 sm:mt-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-text-muted text-[10px] sm:text-xs font-mono">{wordCount} words</span>
              <span className={`text-[10px] sm:text-xs ${tip.color} hidden sm:inline`}>{tip.text}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 sm:mt-4">
            <button
              onClick={() => {
                if (!answer.trim() && currentQ < questions.length - 1) {
                  setShowSkipModal(true);
                }
              }}
              className={`btn-secondary text-xs sm:text-sm !py-2 !px-4 ${
                !answer.trim() && currentQ < questions.length - 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              Skip →
            </button>
            <button
              id="submit-answer-btn"
              onClick={handleSubmitAnswer}
              disabled={submitting || !answer.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                'Submit Answer'
              )}
            </button>
          </div>
        </div>

        {/* Score Preview */}
        {showScore && scores[currentQ] && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              Quick Score
              <span className={`score-badge ${getScoreColor(scores[currentQ].overall)}`}>
                {scores[currentQ].overall}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {[
                { label: 'Relevance', key: 'relevance' },
                { label: 'Clarity', key: 'clarity' },
                { label: 'Technical', key: 'technical_accuracy' },
                { label: 'Communication', key: 'communication' },
              ].map(({ label, key }) => (
                <div key={key} className="bg-surface-light rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center">
                  <div className="text-text-muted text-[10px] sm:text-xs mb-1">{label}</div>
                  <div className={`text-lg sm:text-xl font-bold ${getScoreTextColor(scores[currentQ][key])}`}>
                    {scores[currentQ][key]}/10
                  </div>
                </div>
              ))}
            </div>
            <p className="text-text-secondary text-xs sm:text-sm mb-3">{scores[currentQ].feedback}</p>

            {/* Strengths & Improvements inline */}
            {(scores[currentQ].strengths?.length > 0 || scores[currentQ].improvements?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 pt-3 border-t border-surface-border">
                {scores[currentQ].strengths?.length > 0 && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-text-muted uppercase font-semibold mb-1.5 sm:mb-2">Strengths</div>
                    {scores[currentQ].strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-text-secondary mb-1">
                        <span className="text-success mt-0.5">✓</span> {s}
                      </div>
                    ))}
                  </div>
                )}
                {scores[currentQ].improvements?.length > 0 && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-text-muted uppercase font-semibold mb-1.5 sm:mb-2">Improve</div>
                    {scores[currentQ].improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-text-secondary mb-1">
                        <span className="text-warning mt-0.5">→</span> {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speech Analysis inline */}
            {speechAnalyses[currentQ] && (
              <div className="mt-3 pt-3 border-t border-surface-border">
                <div className="text-[10px] sm:text-xs text-text-muted uppercase font-semibold mb-1.5 sm:mb-2">Speech Analysis</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-surface-light rounded-lg p-2 text-center">
                    <div className="text-[10px] sm:text-xs text-text-muted">Words</div>
                    <div className="text-xs sm:text-sm font-bold text-primary">{speechAnalyses[currentQ].word_count}</div>
                  </div>
                  <div className="bg-surface-light rounded-lg p-2 text-center">
                    <div className="text-[10px] sm:text-xs text-text-muted">Pace</div>
                    <div className={`text-xs sm:text-sm font-bold ${
                      speechAnalyses[currentQ].speaking_pace === 'moderate' ? 'text-success' : 'text-warning'
                    }`}>
                      {speechAnalyses[currentQ].speaking_pace}
                    </div>
                  </div>
                  <div className="bg-surface-light rounded-lg p-2 text-center">
                    <div className="text-[10px] sm:text-xs text-text-muted">Confidence</div>
                    <div className={`text-xs sm:text-sm font-bold ${
                      speechAnalyses[currentQ].confidence_level === 'high' ? 'text-success' :
                      speechAnalyses[currentQ].confidence_level === 'moderate' ? 'text-warning' : 'text-danger'
                    }`}>
                      {speechAnalyses[currentQ].confidence_level}
                    </div>
                  </div>
                  <div className="bg-surface-light rounded-lg p-2 text-center">
                    <div className="text-[10px] sm:text-xs text-text-muted">Fillers</div>
                    <div className={`text-xs sm:text-sm font-bold ${
                      (speechAnalyses[currentQ].filler_words?.length || 0) <= 2 ? 'text-success' : 'text-danger'
                    }`}>
                      {speechAnalyses[currentQ].filler_words?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 session-nav">
          <button
            onClick={handlePrev}
            disabled={currentQ === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm order-2 sm:order-1 w-full sm:w-auto"
          >
            ← Previous
          </button>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center order-1 sm:order-2 question-dots">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentQ(i);
                  setAnswer(answers[i] || '');
                  setShowScore(!!scores[i]);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer border ${
                  i === currentQ
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/15'
                    : answers[i]
                    ? 'bg-success-light text-success border-success/30'
                    : 'bg-white text-text-muted border-surface-border'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQ < questions.length - 1 ? (
            <button onClick={handleNext} className="btn-secondary text-xs sm:text-sm order-3 w-full sm:w-auto">
              Next →
            </button>
          ) : (
            <button
              id="complete-interview-btn"
              onClick={handleCompleteClick}
              disabled={completing || answeredCount === 0}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm order-3 w-full sm:w-auto"
            >
              {completing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finishing...
                </span>
              ) : (
                'Complete Interview ✓'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowCompleteModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-6 sm:p-8 max-w-md w-full relative z-10 animate-fade-in shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-warning-light text-warning flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">⚠</div>
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-text-primary">Finish Interview?</h3>
              <p className="text-text-secondary text-xs sm:text-sm">
                You have <span className="text-warning font-bold">{questions.length - answeredCount}</span> unanswered question{questions.length - answeredCount > 1 ? 's' : ''}. Unanswered questions will receive a score of 0.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="btn-secondary flex-1 text-sm"
              >
                Keep Answering
              </button>
              <button
                onClick={doComplete}
                className="btn-primary flex-1 text-sm"
              >
                Finish Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowSkipModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="bg-white rounded-xl sm:rounded-2xl border border-surface-border p-6 sm:p-8 max-w-md w-full relative z-10 animate-fade-in shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-info-light text-primary flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">→</div>
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-text-primary">Skip This Question?</h3>
              <p className="text-text-secondary text-xs sm:text-sm">
                You can always come back to it later using the question navigation dots.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSkipModal(false)} className="btn-secondary flex-1 text-sm">
                Stay Here
              </button>
              <button onClick={handleSkip} className="btn-primary flex-1 text-sm">
                Skip →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
