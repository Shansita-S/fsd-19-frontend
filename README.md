# Meeting Scheduling Management System - Frontend

## 📋 Project Overview
A modern, responsive frontend application for the Meeting Scheduling Management System. Built with React, this application provides role-based interfaces for organizers and participants to manage and view meetings.

## 🚀 Tech Stack
- **Framework**: React 18.2
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Notifications**: React-Toastify
- **Styling**: Custom CSS (Responsive Design)
- **State Management**: React Hooks (useState, useEffect)

## 👥 User Roles and Features

### ORGANIZER Features
✅ Register and login to the system  
✅ Create new meetings with title, description, time range  
✅ Select multiple participants for meetings  
✅ View all created meetings in dashboard  
✅ Edit existing meetings  
✅ Delete meetings  
✅ Real-time conflict detection with detailed error messages  
✅ View participant list for selection  

### PARTICIPANT Features
✅ Register and login to the system  
✅ View all assigned meetings  
✅ See meeting details (title, description, time, organizer)  
✅ View other participants in meetings  
✅ Meeting status indicators (Upcoming, In Progress, Completed)  

## 🎨 UI Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Role-Based Dashboards**: Different views for organizers and participants
- **Modal Forms**: Clean modal interface for creating/editing meetings
- **Conflict Warnings**: Visual warnings for scheduling conflicts
- **Status Indicators**: Color-coded meeting status
- **Clean Navigation**: Navbar with user info and logout
- **Empty States**: Helpful messages when no data is available

## 🔐 Authentication & Authorization
- JWT token-based authentication
- Automatic token storage in localStorage
- Protected routes based on authentication status
- Role-based component rendering
- Automatic redirect to login on token expiration
- Persistent login sessions

## 📱 Application Structure

```
src/
├── components/
│   ├── Login.js                 # Login page
│   ├── Register.js              # Registration page
│   ├── Navbar.js                # Navigation bar
│   ├── OrganizerDashboard.js    # Organizer dashboard
│   └── ParticipantDashboard.js  # Participant dashboard
├── api.js                       # API service layer
├── App.js                       # Main app component with routing
├── index.js                     # React entry point
└── index.css                    # Global styles
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running

### Environment Variables
Create a `.env` file in the Frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Installation Steps
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🎯 Key Components

### 1. Login Component
- Email and password authentication
- Form validation
- Error handling
- Link to registration page

### 2. Register Component
- User registration with name, email, password
- Role selection (ORGANIZER/PARTICIPANT)
- Client-side validation
- Success handling with auto-login

### 3. Navbar Component
- Displays user name and role
- Logout functionality
- Responsive design

### 4. Organizer Dashboard
- **Meeting List**: Display all created meetings
- **Create Meeting**: Modal form with:
  - Title and description fields
  - Date and time pickers
  - Participant selection with checkboxes
  - Conflict detection and warnings
- **Edit Meeting**: Pre-filled form for updates
- **Delete Meeting**: Confirmation dialog
- **Participant Display**: Shows selected participants

### 5. Participant Dashboard
- View all assigned meetings
- Meeting status (Upcoming/In Progress/Completed)
- Organizer information
- Other participants list
- Read-only view (no edit/delete)

## 📡 API Integration

### API Service (`api.js`)
```javascript
// Axios instance with base URL
// Request interceptor: Adds JWT token
// Response interceptor: Handles 401 errors
// Service methods for auth, meetings, users
```

### Authentication Service
```javascript
authService.register(data)
authService.login(data)
authService.getMe()
authService.setToken(token)
authService.setUser(user)
authService.getUser()
authService.logout()
```

### Meeting Service
```javascript
meetingService.getAllMeetings()
meetingService.getMeeting(id)
meetingService.createMeeting(data)
meetingService.updateMeeting(id, data)
meetingService.deleteMeeting(id)
```

### User Service
```javascript
userService.getParticipants()
```

## ⚠️ Conflict Detection UI

When a scheduling conflict is detected:
1. **409 Conflict** response from backend
2. **Red warning box** displays:
   - ⚠️ Icon and title
   - Conflict message
   - Participant names with conflicts
   - Details of conflicting meetings
3. **Form remains open** for corrections
4. **User can adjust**:
   - Meeting time
   - Participant selection
   - Both

## 🎨 Styling

### CSS Architecture
- **Global Styles**: Reset, typography, utilities
- **Component Styles**: Modular, maintainable
- **Responsive Design**: Mobile-first approach
- **Color Scheme**:
  - Primary: #3498db (Blue)
  - Success: #27ae60 (Green)
  - Danger: #e74c3c (Red)
  - Secondary: #95a5a6 (Gray)
  - Background: #f5f5f5 (Light Gray)

### Responsive Breakpoints
- Desktop: > 768px
- Tablet/Mobile: ≤ 768px

## 🚀 Running the Application

### Development Mode
```bash
npm start
# Opens http://localhost:3000
# Hot reloading enabled
```

### Production Build
```bash
npm run build
# Creates optimized build in /build folder
# Ready for deployment
```

## 📦 Deployment

### Deployment Options
1. **Vercel** (Recommended for React)
2. **Netlify**
3. **GitHub Pages**
4. **AWS S3 + CloudFront**
5. **Firebase Hosting**

### Deployment Steps (Vercel)
1. Push code to GitHub repository
2. Import project in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variable: `REACT_APP_API_URL`
5. Deploy!

### Deployment Steps (Netlify)
1. Push code to GitHub repository
2. New site from Git in Netlify
3. Configure:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variable
5. Create `_redirects` file in public folder:
   ```
   /*  /index.html  200
   ```

## 🔒 Security Features
- JWT token stored in localStorage
- Automatic token injection in requests
- Protected routes (redirect to login)
- Role-based component rendering
- XSS prevention through React
- CSRF protection via JWT

## 📱 User Flow

### First-Time User
1. Visit application → Redirected to Login
2. Click "Register here"
3. Fill registration form (name, email, password, role)
4. Auto-login after successful registration
5. Redirected to role-based dashboard

### Returning User
1. Visit application
2. Check localStorage for token
3. If valid → Dashboard
4. If invalid → Login page

### Organizer Flow
1. Login → Organizer Dashboard
2. Click "Create Meeting"
3. Fill meeting details
4. Select participants
5. Submit (conflict check)
6. If conflict → Adjust and retry
7. Success → Meeting added to list

### Participant Flow
1. Login → Participant Dashboard
2. View all assigned meetings
3. See meeting details
4. Check meeting status
5. View organizer and other participants

## 🧪 Testing the Application

### Manual Testing Checklist
- [ ] Register as ORGANIZER
- [ ] Register as PARTICIPANT
- [ ] Login with both roles
- [ ] Create meeting as organizer
- [ ] Add participants to meeting
- [ ] Create conflicting meeting (should fail)
- [ ] Edit existing meeting
- [ ] Delete meeting
- [ ] View meetings as participant
- [ ] Logout functionality
- [ ] Responsive design on mobile
- [ ] Form validations

## 🐛 Common Issues & Solutions

### Issue: API connection failed
**Solution**: Check REACT_APP_API_URL in .env file

### Issue: Token expired error
**Solution**: Clear localStorage and login again

### Issue: CORS error
**Solution**: Ensure backend CORS is configured for frontend URL

### Issue: Build fails
**Solution**: Delete node_modules and package-lock.json, run npm install

## 📊 Performance Optimization
- React.StrictMode for development warnings
- Conditional rendering to avoid unnecessary renders
- useEffect dependency arrays optimized
- Axios interceptors for token management
- localStorage for persistent authentication

## 🌐 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🌐 Live Deployment Links
- **Frontend**: [To be deployed]
- **Backend API**: [To be deployed]

## 📝 Environment Variables

### Development
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Production
```env
REACT_APP_API_URL=https://your-backend-api.com/api
```

## 🔄 State Management
- **Local State**: Component-level useState
- **Auth State**: localStorage + App.js state
- **API State**: Loading, error, data patterns
- No Redux (not needed for this scale)

## 📄 License
MIT License

## 🤝 Contributing
This is an assignment project. No contributions are expected.

## 📞 Support
For issues or questions, please contact the development team.

---
**Built with ❤️ for FSD Assignment**
