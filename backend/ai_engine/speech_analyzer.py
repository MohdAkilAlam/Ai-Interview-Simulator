from typing import Dict, List
import re


def analyze_speech(text: str) -> Dict:
    """Analyze speech patterns from transcribed text."""

    words = text.split()
    word_count = len(words)

    # Common filler words
    filler_list = [
        "um", "uh", "like", "you know", "basically", "actually",
        "literally", "right", "so", "well", "I mean", "kind of",
        "sort of", "honestly", "obviously",
    ]

    found_fillers = []
    text_lower = text.lower()
    for filler in filler_list:
        count = text_lower.count(filler)
        if count > 0:
            found_fillers.extend([filler] * count)

    # Estimate speaking pace (assuming ~2 seconds per sentence)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    sentence_count = max(len(sentences), 1)

    avg_words_per_sentence = word_count / sentence_count

    if avg_words_per_sentence < 8:
        pace = "slow"
    elif avg_words_per_sentence < 20:
        pace = "moderate"
    else:
        pace = "fast"

    # Confidence indicators
    uncertain_words = ["maybe", "perhaps", "i think", "i guess", "not sure", "probably", "might"]
    confident_words = ["definitely", "certainly", "absolutely", "i believe", "i am confident", "clearly"]

    uncertain_count = sum(1 for w in uncertain_words if w in text_lower)
    confident_count = sum(1 for w in confident_words if w in text_lower)

    if confident_count > uncertain_count + 1:
        confidence = "high"
    elif uncertain_count > confident_count + 1:
        confidence = "low"
    else:
        confidence = "moderate"

    # Generate suggestions
    suggestions = []
    if len(found_fillers) > 2:
        suggestions.append(f"Try to reduce filler words (found {len(found_fillers)}). Practice pausing instead.")
    if pace == "fast":
        suggestions.append("Consider slowing down your speech for better clarity.")
    elif pace == "slow":
        suggestions.append("Try to maintain a more engaging pace in your responses.")
    if confidence == "low":
        suggestions.append("Use more assertive language to convey confidence.")
    if word_count < 20:
        suggestions.append("Provide more detailed responses to fully demonstrate your knowledge.")
    if not suggestions:
        suggestions.append("Good speaking patterns! Keep practicing to maintain consistency.")

    return {
        "word_count": word_count,
        "speaking_pace": pace,
        "filler_words": found_fillers,
        "confidence_level": confidence,
        "suggestions": suggestions,
    }
