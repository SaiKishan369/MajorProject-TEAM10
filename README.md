# EventHub - Advanced Campus Event Management System

A comprehensive event management application built with React frontend and Flask backend, featuring separate admin and student portals with advanced functionality.

## 🚀 Features

### Admin Portal
- **Dashboard Analytics**: View total events, users, registrations, and revenue
- **Event Management**: Create, edit, and delete events with rich details
- **User Management**: Monitor student registrations and profiles
- **Registration Tracking**: View all event registrations and payment statuses
- **Category Management**: Organize events by categories

### Student Portal
- **Event Discovery**: Browse events with filtering and search capabilities
- **User Registration**: Student account creation and management
- **Event Registration**: Easy registration process for events
- **Payment Integration**: Simulated payment gateway for paid events
- **Responsive Design**: Mobile-friendly interface

### Core Features
- **Modern UI/UX**: Professional design with consistent theming
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Works seamlessly on all devices
- **Search & Filtering**: Advanced event discovery
- **Payment Processing**: Simulated payment system
- **User Management**: Complete user lifecycle management

## 🛠️ Technology Stack

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **CSS3** with custom properties and responsive design
- **Font Awesome** for icons

### Backend
- **Flask** web framework
- **Flask-CORS** for cross-origin requests
- **Python 3.8+** compatibility

## 📁 Project Structure

```
├── app.py                 # Flask backend with all API endpoints
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
├── src/
│   ├── App.jsx          # Main app with routing
│   ├── api.js           # API client functions
│   ├── main.jsx         # App entry point
│   ├── styles.css       # Global styles
│   └── components/
│       ├── AdminPortal.jsx    # Admin dashboard and management
│       └── StudentPortal.jsx  # Student event browsing and registration
├── index.html            # HTML template
└── vite.config.js        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the Flask server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup
1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 🌐 API Endpoints

### Events
- `GET /events` - Get all events with optional filtering
- `GET /events/<id>` - Get specific event details
- `POST /events` - Create new event (Admin)
- `PUT /events/<id>` - Update event (Admin)
- `DELETE /events/<id>` - Delete event (Admin)

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user (Student registration)

### Event Registration
- `POST /events/<id>/register` - Register for an event
- `POST /payments/process` - Process payment for registration

### Admin Dashboard
- `GET /registrations` - Get all registrations
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /categories` - Get event categories

## 🎨 UI Components

### Navigation
- Responsive navbar with admin/student portal links
- Active state indicators
- Mobile-friendly design

### Dashboard Cards
- Statistics cards with hover effects
- Category charts and analytics
- Recent activity feeds

### Event Cards
- Rich event information display
- Image support with fallbacks
- Interactive hover states

### Forms
- Comprehensive form validation
- Responsive form layouts
- Modal-based interactions

## 🔐 Security Features

- Input validation and sanitization
- CORS configuration for development
- Simulated payment processing
- User authentication simulation

## 📱 Responsive Design

- Mobile-first approach
- Grid-based layouts
- Flexible component sizing
- Touch-friendly interactions

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Backend Deployment
- Configure production WSGI server (Gunicorn)
- Set environment variables
- Configure database (replace in-memory storage)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for modern campus event management**
