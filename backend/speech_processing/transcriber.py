import speech_recognition as sr
import tempfile
import os


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """Convert audio bytes to text using SpeechRecognition library."""

    recognizer = sr.Recognizer()

    # Save bytes to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with sr.AudioFile(tmp_path) as source:
            audio = recognizer.record(source)

        # Try Google Speech Recognition
        try:
            text = recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            return "[Could not understand audio]"
        except sr.RequestError as e:
            return f"[Speech recognition error: {e}]"
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
