import json
import random
from typing import List
from config import OPENAI_API_KEY

# Fallback question bank when OpenAI API key is not available
QUESTION_BANK = {
    "HR": {
        "Beginner": [
            "Tell me about yourself.",
            "Why are you interested in this position?",
            "What are your greatest strengths?",
            "What is your greatest weakness?",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?",
            "Tell me about a time you worked in a team.",
            "How do you handle stress and pressure?",
            "What motivates you?",
            "Do you have any questions for us?",
        ],
        "Intermediate": [
            "Describe a challenging situation at work and how you handled it.",
            "Tell me about a time you disagreed with your manager.",
            "How do you prioritize your tasks when you have multiple deadlines?",
            "Describe your ideal work environment.",
            "Tell me about a time you failed and what you learned from it.",
            "How do you handle constructive criticism?",
            "What is your management style?",
            "Tell me about a time you went above and beyond.",
            "How do you handle conflict with a coworker?",
            "Describe a time when you had to learn something quickly.",
        ],
        "Advanced": [
            "Tell me about a time you had to make a difficult ethical decision at work.",
            "How have you handled a situation where company policy conflicted with what you believed was right?",
            "Describe a time when you had to influence stakeholders without direct authority.",
            "Tell me about the most complex project you've managed.",
            "How do you approach building a diverse and inclusive team?",
            "Describe a situation where you had to pivot strategy mid-project.",
            "How do you measure success in your role?",
            "Tell me about a time you had to deliver bad news to a client or stakeholder.",
            "How do you stay current with industry trends?",
            "Describe your approach to mentoring junior team members.",
        ],
    },
    "Technical": {
        "Beginner": [
            "What is the difference between a stack and a queue?",
            "Explain what an API is in simple terms.",
            "What is the difference between SQL and NoSQL databases?",
            "Explain the concept of version control.",
            "What is the difference between HTTP and HTTPS?",
            "What is Object-Oriented Programming?",
            "Explain the difference between frontend and backend development.",
            "What are CSS flexbox and grid?",
            "What is a REST API?",
            "Explain the concept of responsive design.",
        ],
        "Intermediate": [
            "Explain the concept of closures in JavaScript.",
            "What is the difference between SQL joins? Explain with examples.",
            "How does garbage collection work in modern programming languages?",
            "Explain the SOLID principles in software design.",
            "What is the difference between authentication and authorization?",
            "Explain microservices architecture and its advantages.",
            "How would you optimize a slow database query?",
            "What is the event loop in Node.js?",
            "Explain the concept of dependency injection.",
            "What are design patterns? Name three and explain one in detail.",
        ],
        "Advanced": [
            "Explain the CAP theorem and its implications for distributed systems.",
            "How would you design a scalable real-time chat application?",
            "Explain the differences between eventual consistency and strong consistency.",
            "How would you implement a rate limiter for an API?",
            "Describe the trade-offs between monolithic and microservices architectures.",
            "How would you design a URL shortener service?",
            "Explain how a blockchain consensus mechanism works.",
            "How would you handle database sharding for a high-traffic application?",
            "Describe the internals of a container orchestration system.",
            "How would you design an authentication system that supports SSO, OAuth, and MFA?",
        ],
    },
    "Behavioral": {
        "Beginner": [
            "Tell me about a time you helped a teammate.",
            "Describe a goal you set and how you achieved it.",
            "Tell me about a time you received feedback.",
            "Describe a situation where you had to be flexible.",
            "Tell me about a time you solved a problem creatively.",
            "Describe a time when you had to meet a tight deadline.",
            "Tell me about your first job experience.",
            "How do you organize your daily work?",
            "Tell me about a time you made a mistake.",
            "Describe a time when you exceeded expectations.",
        ],
        "Intermediate": [
            "Tell me about a time you led a project from start to finish.",
            "Describe a situation where you had to persuade someone to see your point of view.",
            "Tell me about a time you had to work with a difficult team member.",
            "Describe a situation where you had to make a decision with incomplete information.",
            "Tell me about a time you identified a process improvement.",
            "Describe a challenging customer interaction and how you resolved it.",
            "Tell me about a time you had to balance competing priorities.",
            "Describe a situation where you had to adapt to a major change.",
            "Tell me about a time you took initiative on a project.",
            "Describe a time when you had to collaborate across departments.",
        ],
        "Advanced": [
            "Tell me about a time you transformed a failing project into a success.",
            "Describe a situation where you had to make an unpopular decision.",
            "Tell me about the most significant impact you've had at a previous organization.",
            "Describe a time when you had to navigate organizational politics.",
            "Tell me about a time you had to build a team from scratch.",
            "Describe a crisis situation you managed and the outcome.",
            "Tell me about a time you had to change someone's mind on a strategic decision.",
            "Describe how you've handled a situation with competing stakeholder interests.",
            "Tell me about a time you implemented a significant organizational change.",
            "Describe a situation where you had to make a trade-off between speed and quality.",
        ],
    },
}


async def generate_questions(
    interview_type: str, job_role: str, difficulty: str, num_questions: int = 5
) -> List[str]:
    """Generate interview questions using OpenAI API or fallback to question bank."""

    if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here":
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=OPENAI_API_KEY)

            prompt = f"""Generate {num_questions} interview questions for the following:
- Interview Type: {interview_type}
- Job Role: {job_role}
- Difficulty Level: {difficulty}

The questions should be realistic and commonly asked in real interviews.
Return ONLY a JSON array of strings, each string being a question.
Example: ["Question 1?", "Question 2?"]"""

            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert interview coach. Generate realistic interview questions.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.8,
                max_tokens=1000,
            )

            content = response.choices[0].message.content.strip()
            # Parse JSON from response
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            questions = json.loads(content)
            return questions[:num_questions]

        except Exception as e:
            print(f"OpenAI API error, falling back to question bank: {e}")

    # Fallback: use curated question bank
    type_key = interview_type if interview_type in QUESTION_BANK else "HR"
    diff_key = difficulty if difficulty in QUESTION_BANK[type_key] else "Beginner"
    pool = QUESTION_BANK[type_key][diff_key]
    return random.sample(pool, min(num_questions, len(pool)))
