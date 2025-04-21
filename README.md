# PantherFinder - Lost and Found Application

PantherFinder is a modern web application designed to help university students find their lost items on campus. It provides a platform for users to report found items, search for lost items, and claim items that belong to them.

## Features

- **User Authentication**: Secure login and registration system
- **Item Submission**: Submit found items with details and images
- **Item Search**: Search for lost items with filters (category, location, date)
- **Item Claims**: Claim items that belong to you
- **Notifications**: Get notified when matching items are found
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Sleek and intuitive user interface with Tailwind CSS
- **Animated Aurora Branding**: Eye-catching animated gradient effect on the PantherFinder brand name
- **Customizable Navbar**: Large, visually prominent navbar with optional logo support
- **Improved Accessibility**: Enhanced text visibility and error feedback for login and dashboard

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- Git

### Clone the Repository

```bash
git clone https://github.com/mukhil0212/PantherFinder.git
cd PantherFinder
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. (Optional) To use a custom logo, place `logo.png` in the `frontend/public/` directory and update the navbar/header code to display it.

### Styling Notes

- The navbar height and background have been adjusted for a cleaner, more modern look.
- The aurora text effect is used for the PantherFinder brand name for increased visual appeal.
- Non-standard CSS at-rules have been removed for full compatibility with Tailwind CSS and modern build tools.

### Accessibility & UX

- All important text and error messages are styled for maximum readability.
- The login and dashboard pages have been improved for accessibility and feedback clarity.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your configuration:
```
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

5. Run the Flask server:
```bash
FLASK_DEBUG=1 python run.py
```

The backend API will be available at http://localhost:5001

## Project Structure

```
PantherFinder/
├── frontend/               # Next.js frontend
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   └── lib/            # Utility functions
├── backend/                # Flask backend
│   ├── app/                # Application code
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── run.py              # Entry point
└── README.md               # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flask](https://flask.palletsprojects.com/)
- [Supabase](https://supabase.io/)