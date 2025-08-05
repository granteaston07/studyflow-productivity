# StudyFlow - Smart Student Productivity

A clean, modern productivity app designed specifically for students to manage their schoolwork efficiently.

## Features

### 🎯 Task Management
- Create, edit, and organize tasks with priority levels
- Drag-and-drop task reordering
- Task completion tracking with analytics

### 📅 Study Calendar
- Set daily study goals
- Visual calendar interface
- Goal progress tracking

### ⏱️ Focus Timer
- Pomodoro-style focus sessions
- Customizable timer durations
- Session tracking and analytics

### 📊 Analytics Dashboard
- Task completion statistics
- Study session insights
- Progress visualization with charts

### 🤖 AI Study Suggestions
- Personalized study recommendations
- Smart scheduling suggestions
- Goal optimization tips

### 📝 Quick Notes
- Fast note-taking interface
- Persistent note storage
- Easy note management

### 🎨 Customization
- Light/dark theme toggle
- Responsive design for all devices
- Clean, modern interface

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **State Management**: TanStack Query + React hooks
- **Backend**: Supabase (auth, database, edge functions)
- **UI Components**: Radix UI + Shadcn/ui
- **Charts**: Recharts
- **Build Tool**: Vite
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 16+ or Bun
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd studyflow
```

2. Install dependencies
```bash
npm install
# or
bun install
```

3. Set up environment variables
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── AddTaskForm.tsx # Task creation form
│   ├── StudyCalendar.tsx # Calendar interface
│   ├── FocusTimer.tsx  # Pomodoro timer
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication logic
│   ├── useTasks.tsx    # Task management
│   └── useNotes.tsx    # Notes management
├── pages/              # Route components
│   ├── Landing.tsx     # Landing page
│   ├── Auth.tsx        # Authentication page
│   └── Index.tsx       # Main app dashboard
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
└── lib/                # Utility functions
```

## Database Schema

The app uses Supabase with the following main tables:
- `tasks` - User tasks with priorities and completion status
- `study_goals` - Daily study goals and progress
- `notes` - Quick notes and study materials
- `focus_sessions` - Timer session records

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@studyflow.app or join our Discord community.