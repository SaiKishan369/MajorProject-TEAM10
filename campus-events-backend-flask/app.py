from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory "database"
events = [
    {
        "id": 1, 
        "title": "Hackathon", 
        "date": "2025-09-01", 
        "description": "Annual coding competition for students to showcase their programming skills.",
        "form_link": "https://docs.google.com/forms/d/e/1FAIpQLSdXRxEgY7W1a9wrMwqBRcHWefJKDjNhki3i0fn12BFLAQijTA/viewform?usp=dialog",
        "speaker": {
            "name": "Dr. Sarah Johnson",
            "title": "CTO at Tech Innovations Inc.",
            "bio": "Expert in AI and Machine Learning with 15+ years of industry experience."
        }
    },
    {
        "id": 2, 
        "title": "Cultural Fest", 
        "date": "2025-09-15", 
        "description": "Celebration of cultural diversity through music, dance, and art performances.",
        "form_link": "https://forms.gle/example2",
        "speaker": {
            "name": "Prof. Michael Chen",
            "title": "Dean of Arts & Culture",
            "bio": "Renowned cultural historian and event organizer with a passion for traditional arts."
        }
    }
]

@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/events")
def get_events():
    # Returns a plain array so the React app can consume it directly
    return jsonify(events), 200

@app.post("/addevent")
def add_event():
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    title = (data.get("title") or "").strip()
    date = (data.get("date") or "").strip()
    description = (data.get("description") or "").strip()
    form_link = (data.get("form_link") or "").strip()
    speaker = data.get("speaker", {})

    if not title or not date:
        return jsonify({"status": "error", "message": "title and date are required"}), 400

    # naive YYYY-MM-DD check
    import re
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        return jsonify({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400

    new_id = (max((e["id"] for e in events), default=0) + 1) if events else 1
    
    new_event = {
        "id": new_id, 
        "title": title, 
        "date": date, 
        "description": description,
        "form_link": form_link,
        "speaker": {
            "name": speaker.get("name", "").strip(),
            "title": speaker.get("title", "").strip(),
            "bio": speaker.get("bio", "").strip()
        }
    }
    
    events.append(new_event)
    return jsonify({"status": "success", "event": new_event}), 201

@app.delete("/events/<int:event_id>")
def delete_event(event_id):
    global events
    initial_length = len(events)
    events = [e for e in events if e["id"] != event_id]
    
    if len(events) < initial_length:
        return jsonify({"status": "success", "message": "Event deleted"}), 200
    else:
        return jsonify({"status": "error", "message": "Event not found"}), 404

if __name__ == "__main__":
    # Use Flask's built-in server for development
    app.run(host="0.0.0.0", port=5000, debug=True)
