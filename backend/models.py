from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from datetime import date

db = SQLAlchemy()

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {"id": self.id, "title": self.title, "date": self.date, "location": self.location}