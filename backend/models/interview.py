from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class InterviewSetup(BaseModel):
    interview_type: str  # HR, Technical, Behavioral
    job_role: str  # Frontend Developer, Backend Developer, etc.
    difficulty: str  # Beginner, Intermediate, Advanced
    num_questions: int = 5


class AnswerSubmission(BaseModel):
    interview_id: str
    question_index: int
    answer_text: str
    is_voice: bool = False


class QuestionScore(BaseModel):
    question: str
    answer: str
    relevance: float
    clarity: float
    technical_accuracy: float
    communication: float
    overall: float
    feedback: str
    strengths: List[str]
    improvements: List[str]


class SpeechAnalysis(BaseModel):
    word_count: int
    speaking_pace: str  # slow, moderate, fast
    filler_words: List[str]
    confidence_level: str  # low, moderate, high
    suggestions: List[str]


class InterviewSession(BaseModel):
    id: str
    user_id: str
    interview_type: str
    job_role: str
    difficulty: str
    questions: List[str]
    answers: List[Optional[str]]
    scores: List[Optional[dict]]
    speech_analyses: List[Optional[dict]]
    overall_score: Optional[float] = None
    status: str  # in_progress, completed
    created_at: datetime
    completed_at: Optional[datetime] = None


class InterviewFeedback(BaseModel):
    interview_id: str
    overall_score: float
    question_scores: List[QuestionScore]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    speech_analysis: Optional[SpeechAnalysis] = None
