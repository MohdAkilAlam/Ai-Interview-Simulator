import json
from typing import Dict, List
from config import OPENAI_API_KEY


async def analyze_answer(
    question: str, answer: str, interview_type: str, job_role: str, difficulty: str
) -> Dict:
    """Analyze an interview answer using OpenAI API or rule-based fallback."""

    if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here":
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=OPENAI_API_KEY)

            prompt = f"""Evaluate this interview answer:

Question: {question}
Answer: {answer}
Interview Type: {interview_type}
Job Role: {job_role}
Difficulty: {difficulty}

Score the answer on each criterion from 0 to 10:
1. Relevance - How relevant is the answer to the question?
2. Clarity - How clear and well-structured is the response?
3. Technical Accuracy - How technically correct is the content?
4. Communication - How well does the candidate communicate?

Also provide:
- A brief feedback paragraph
- 2-3 strengths (as a list)
- 2-3 areas for improvement (as a list)

Return ONLY valid JSON in this exact format:
{{
    "relevance": 7,
    "clarity": 8,
    "technical_accuracy": 6,
    "communication": 7,
    "overall": 7,
    "feedback": "Your answer was...",
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"]
}}"""

            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert interview evaluator. Analyze interview answers and provide constructive feedback. Always return valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=800,
            )

            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(content)

        except Exception as e:
            print(f"OpenAI API error in answer analysis, using fallback: {e}")

    # Fallback: rule-based analysis
    return _rule_based_analysis(question, answer)


def _rule_based_analysis(question: str, answer: str) -> Dict:
    """Simple rule-based analysis when OpenAI is unavailable."""
    word_count = len(answer.split())

    # Score based on answer length and content
    if word_count < 10:
        base_score = 3
        feedback = "Your answer is too brief. Try to provide more detail and examples to support your points."
        strengths = ["Concise response"]
        improvements = [
            "Provide more detail and examples",
            "Elaborate on your key points",
            "Use the STAR method for behavioral questions",
        ]
    elif word_count < 30:
        base_score = 5
        feedback = "Your answer has a decent foundation but could be more detailed. Consider adding specific examples from your experience."
        strengths = ["Addressed the question", "Reasonably concise"]
        improvements = [
            "Add specific examples",
            "Provide more depth in your explanation",
        ]
    elif word_count < 100:
        base_score = 7
        feedback = "Good answer with reasonable detail. Consider structuring your response more clearly and adding quantifiable results."
        strengths = [
            "Good level of detail",
            "Addressed the question well",
            "Clear communication",
        ]
        improvements = [
            "Add quantifiable results where possible",
            "Structure response more clearly",
        ]
    else:
        base_score = 8
        feedback = "Comprehensive answer with good detail. Make sure to stay focused on the key points and avoid unnecessary tangents."
        strengths = [
            "Thorough and detailed response",
            "Strong communication skills",
            "Good depth of knowledge",
        ]
        improvements = [
            "Consider being more concise",
            "Prioritize the most impactful points",
        ]

    # Check for question keywords in answer (basic relevance check)
    question_words = set(question.lower().split())
    answer_words = set(answer.lower().split())
    common_words = question_words & answer_words - {
        "the", "a", "an", "is", "are", "was", "were", "what", "how", "why",
        "tell", "me", "about", "your", "you", "do", "did", "have", "has",
    }
    relevance_bonus = min(len(common_words) * 0.5, 2)

    relevance = min(round(base_score + relevance_bonus, 1), 10)
    clarity = min(round(base_score + 0.5, 1), 10)
    technical = min(round(base_score - 0.5, 1), 10)
    communication = min(round(base_score + 0.3, 1), 10)
    overall = round((relevance + clarity + technical + communication) / 4, 1)

    return {
        "relevance": relevance,
        "clarity": clarity,
        "technical_accuracy": technical,
        "communication": communication,
        "overall": overall,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
    }
