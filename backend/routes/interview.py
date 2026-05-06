from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional
from database import get_db
from models.interview import InterviewSetup, AnswerSubmission
from auth.jwt_handler import get_current_user
from ai_engine.question_generator import generate_questions
from ai_engine.answer_analyzer import analyze_answer
from ai_engine.speech_analyzer import analyze_speech
from speech_processing.transcriber import transcribe_audio

router = APIRouter()


@router.post("/start")
async def start_interview(setup: InterviewSetup, current_user: dict = Depends(get_current_user)):
    db = get_db()

    questions = await generate_questions(
        setup.interview_type, setup.job_role, setup.difficulty, setup.num_questions
    )

    interview_doc = {
        "user_id": current_user["user_id"],
        "interview_type": setup.interview_type,
        "job_role": setup.job_role,
        "difficulty": setup.difficulty,
        "questions": questions,
        "answers": [None] * len(questions),
        "scores": [None] * len(questions),
        "speech_analyses": [None] * len(questions),
        "overall_score": None,
        "status": "in_progress",
        "created_at": datetime.now(timezone.utc),
        "completed_at": None,
    }

    result = await db.interviews.insert_one(interview_doc)

    return {
        "message": "Interview started",
        "interview_id": str(result.inserted_id),
        "questions": questions,
        "interview_type": setup.interview_type,
        "job_role": setup.job_role,
        "difficulty": setup.difficulty,
    }


@router.post("/answer")
async def submit_answer(submission: AnswerSubmission, current_user: dict = Depends(get_current_user)):
    db = get_db()

    interview = await db.interviews.find_one({
        "_id": ObjectId(submission.interview_id),
        "user_id": current_user["user_id"],
    })

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview["status"] == "completed":
        raise HTTPException(status_code=400, detail="Interview already completed")

    if submission.question_index >= len(interview["questions"]):
        raise HTTPException(status_code=400, detail="Invalid question index")

    question = interview["questions"][submission.question_index]

    # Analyze the answer
    score = await analyze_answer(
        question,
        submission.answer_text,
        interview["interview_type"],
        interview["job_role"],
        interview["difficulty"],
    )

    # Analyze speech patterns
    speech = analyze_speech(submission.answer_text)

    # Update interview document
    await db.interviews.update_one(
        {"_id": ObjectId(submission.interview_id)},
        {
            "$set": {
                f"answers.{submission.question_index}": submission.answer_text,
                f"scores.{submission.question_index}": score,
                f"speech_analyses.{submission.question_index}": speech,
            }
        },
    )

    return {
        "message": "Answer submitted",
        "question_index": submission.question_index,
        "score": score,
        "speech_analysis": speech,
    }


@router.post("/answer-audio/{interview_id}/{question_index}")
async def submit_audio_answer(
    interview_id: str,
    question_index: int,
    audio: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    interview = await db.interviews.find_one({
        "_id": ObjectId(interview_id),
        "user_id": current_user["user_id"],
    })

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Read audio and transcribe
    audio_bytes = await audio.read()
    transcribed_text = await transcribe_audio(audio_bytes, audio.filename or "audio.wav")

    if transcribed_text.startswith("["):
        return {"message": "Could not process audio", "error": transcribed_text}

    question = interview["questions"][question_index]

    # Analyze the transcribed answer
    score = await analyze_answer(
        question,
        transcribed_text,
        interview["interview_type"],
        interview["job_role"],
        interview["difficulty"],
    )

    speech = analyze_speech(transcribed_text)

    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {
            "$set": {
                f"answers.{question_index}": transcribed_text,
                f"scores.{question_index}": score,
                f"speech_analyses.{question_index}": speech,
            }
        },
    )

    return {
        "message": "Audio answer submitted",
        "transcribed_text": transcribed_text,
        "score": score,
        "speech_analysis": speech,
    }


@router.post("/complete/{interview_id}")
async def complete_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()

    interview = await db.interviews.find_one({
        "_id": ObjectId(interview_id),
        "user_id": current_user["user_id"],
    })

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Calculate overall score
    scores = [s for s in interview["scores"] if s is not None]
    if scores:
        overall = round(sum(s["overall"] for s in scores) / len(scores), 1)
    else:
        overall = 0.0

    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {
            "$set": {
                "status": "completed",
                "overall_score": overall,
                "completed_at": datetime.now(timezone.utc),
            }
        },
    )

    # Update user stats
    user_interviews = await db.interviews.count_documents({
        "user_id": current_user["user_id"],
        "status": "completed",
    })

    pipeline = [
        {"$match": {"user_id": current_user["user_id"], "status": "completed"}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$overall_score"}}},
    ]
    agg_result = await db.interviews.aggregate(pipeline).to_list(1)
    avg_score = agg_result[0]["avg_score"] if agg_result else 0.0

    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {
            "$set": {
                "total_interviews": user_interviews,
                "average_score": round(avg_score, 1),
            }
        },
    )

    return {
        "message": "Interview completed",
        "overall_score": overall,
    }


@router.get("/session/{interview_id}")
async def get_interview_session(interview_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()

    interview = await db.interviews.find_one({
        "_id": ObjectId(interview_id),
        "user_id": current_user["user_id"],
    })

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Generate overall feedback
    scores = [s for s in interview["scores"] if s is not None]
    all_strengths = []
    all_weaknesses = []
    all_suggestions = []

    for s in scores:
        all_strengths.extend(s.get("strengths", []))
        all_weaknesses.extend(s.get("improvements", []))

    # Deduplicate
    strengths = list(dict.fromkeys(all_strengths))[:5]
    weaknesses = list(dict.fromkeys(all_weaknesses))[:5]

    if interview.get("overall_score", 0) >= 7:
        all_suggestions.append("Great performance! Keep practicing to maintain your skills.")
    elif interview.get("overall_score", 0) >= 5:
        all_suggestions.append("Good effort! Focus on providing more specific examples.")
        all_suggestions.append("Practice structuring your answers using the STAR method.")
    else:
        all_suggestions.append("Consider researching common interview questions for your role.")
        all_suggestions.append("Practice with a friend or mentor to build confidence.")
        all_suggestions.append("Focus on providing concrete examples from your experience.")

    return {
        "id": str(interview["_id"]),
        "user_id": interview["user_id"],
        "interview_type": interview["interview_type"],
        "job_role": interview["job_role"],
        "difficulty": interview["difficulty"],
        "questions": interview["questions"],
        "answers": interview["answers"],
        "scores": interview["scores"],
        "speech_analyses": interview["speech_analyses"],
        "overall_score": interview.get("overall_score"),
        "status": interview["status"],
        "created_at": interview["created_at"].isoformat(),
        "completed_at": interview["completed_at"].isoformat() if interview.get("completed_at") else None,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": all_suggestions,
    }


@router.get("/history")
async def get_interview_history(current_user: dict = Depends(get_current_user)):
    db = get_db()

    cursor = db.interviews.find(
        {"user_id": current_user["user_id"]},
        {
            "questions": 0,
            "answers": 0,
            "scores": 0,
            "speech_analyses": 0,
        },
    ).sort("created_at", -1).limit(50)

    interviews = []
    async for doc in cursor:
        interviews.append({
            "id": str(doc["_id"]),
            "interview_type": doc["interview_type"],
            "job_role": doc["job_role"],
            "difficulty": doc["difficulty"],
            "overall_score": doc.get("overall_score"),
            "status": doc["status"],
            "created_at": doc["created_at"].isoformat(),
            "completed_at": doc["completed_at"].isoformat() if doc.get("completed_at") else None,
        })

    return {"interviews": interviews}


@router.delete("/delete/{interview_id}")
async def delete_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()

    interview = await db.interviews.find_one({
        "_id": ObjectId(interview_id),
        "user_id": current_user["user_id"],
    })

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    await db.interviews.delete_one({"_id": ObjectId(interview_id)})

    # Recalculate user stats
    user_interviews = await db.interviews.count_documents({
        "user_id": current_user["user_id"],
        "status": "completed",
    })

    pipeline = [
        {"$match": {"user_id": current_user["user_id"], "status": "completed"}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$overall_score"}}},
    ]
    agg_result = await db.interviews.aggregate(pipeline).to_list(1)
    avg_score = agg_result[0]["avg_score"] if agg_result else 0.0

    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {
            "$set": {
                "total_interviews": user_interviews,
                "average_score": round(avg_score, 1),
            }
        },
    )

    return {"message": "Interview deleted"}


@router.get("/stats")
async def get_interview_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()

    completed = await db.interviews.find(
        {"user_id": current_user["user_id"], "status": "completed"},
        {"interview_type": 1, "difficulty": 1, "overall_score": 1, "created_at": 1, "job_role": 1},
    ).sort("created_at", -1).to_list(100)

    # Difficulty breakdown
    difficulty_stats = {}
    for doc in completed:
        diff = doc.get("difficulty", "Unknown")
        if diff not in difficulty_stats:
            difficulty_stats[diff] = {"count": 0, "total_score": 0}
        difficulty_stats[diff]["count"] += 1
        difficulty_stats[diff]["total_score"] += doc.get("overall_score", 0)

    difficulty_breakdown = [
        {
            "difficulty": k,
            "count": v["count"],
            "avg_score": round(v["total_score"] / v["count"], 1) if v["count"] > 0 else 0,
        }
        for k, v in difficulty_stats.items()
    ]

    # Type breakdown
    type_stats = {}
    for doc in completed:
        t = doc.get("interview_type", "Unknown")
        if t not in type_stats:
            type_stats[t] = {"count": 0, "total_score": 0}
        type_stats[t]["count"] += 1
        type_stats[t]["total_score"] += doc.get("overall_score", 0)

    type_breakdown = [
        {
            "type": k,
            "count": v["count"],
            "avg_score": round(v["total_score"] / v["count"], 1) if v["count"] > 0 else 0,
        }
        for k, v in type_stats.items()
    ]

    # Role breakdown
    role_stats = {}
    for doc in completed:
        r = doc.get("job_role", "Unknown")
        if r not in role_stats:
            role_stats[r] = {"count": 0, "total_score": 0}
        role_stats[r]["count"] += 1
        role_stats[r]["total_score"] += doc.get("overall_score", 0)

    role_breakdown = [
        {
            "role": k,
            "count": v["count"],
            "avg_score": round(v["total_score"] / v["count"], 1) if v["count"] > 0 else 0,
        }
        for k, v in role_stats.items()
    ]

    # Calculate streak (consecutive days with interviews)
    streak = 0
    if completed:
        from datetime import timedelta
        today = datetime.now(timezone.utc).date()
        current_date = today
        interview_dates = set()
        for doc in completed:
            interview_dates.add(doc["created_at"].date())
        while current_date in interview_dates:
            streak += 1
            current_date -= timedelta(days=1)

    return {
        "difficulty_breakdown": difficulty_breakdown,
        "type_breakdown": type_breakdown,
        "role_breakdown": role_breakdown,
        "total_completed": len(completed),
        "streak": streak,
    }
