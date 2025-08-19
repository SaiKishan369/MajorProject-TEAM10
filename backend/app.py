from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Event
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    @app.route('/health')
    def health():
        return jsonify({'status':'ok'})

    @app.route('/events', methods=['GET'])
    def get_events():
        events = Event.query.all()
        return jsonify([e.to_dict() for e in events])
    
    @app.route('/events/<int:event_id>', methods=['GET'])
    def get_event_by_id(event_id):
        event = Event.query.get(event_id)
        return jsonify(event.to_dict())

    @app.route('/events', methods=['POST'])
    def create_event():
        data = request.get_json()
        ev = Event(title=data['title'], date=data['date'], location=data['location'])
        db.session.add(ev)
        db.session.commit()
        return jsonify(ev.to_dict()), 201

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)