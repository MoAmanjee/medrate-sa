# 🏥 MedRate SA - Modern Healthcare Platform

A modern, sleek, and professional healthcare platform inspired by Discovery.co.za, designed to connect patients with verified doctors and hospitals across South Africa.

## ✨ Features

### 🎨 **Modern Discovery-Inspired Design**
- **Professional UI/UX**: Clean, modern interface with Discovery-inspired color palette
- **Responsive Design**: Mobile-first approach for all devices
- **Smooth Animations**: Fade-in, slide-in, and scale effects
- **Glass Morphism**: Modern backdrop blur effects
- **Gradient Backgrounds**: Professional color transitions

### 🏥 **Core Functionality**
- **Hospital Directory**: Comprehensive database of 1,342+ hospitals across South Africa
- **Doctor Profiles**: Verified doctor profiles with specialties and ratings
- **Advanced Search**: Search by location, specialty, type, and rating
- **Interactive Maps**: Google Maps integration with radius filtering
- **Patient Reviews**: Authentic reviews and ratings system
- **Appointment Booking**: Direct booking system with secure payments

### 🤖 **AI-Powered Features**
- **DocBot AI**: Intelligent healthcare assistant for symptom analysis
- **Smart Recommendations**: AI-powered doctor and hospital recommendations
- **Health Insights**: Personalized health insights and guidance

### 💼 **Business Features**
- **Subscription Plans**: Tiered plans for doctors and hospitals
- **Telemedicine**: Video consultation capabilities
- **Analytics Dashboard**: Comprehensive analytics for healthcare providers
- **Corporate Accounts**: Enterprise solutions for companies
- **Marketplace**: Health and wellness product marketplace

## 🚀 Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Google Maps API** - Interactive mapping

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma ORM** - Database toolkit
- **SQLite** - Lightweight database
- **OpenAI API** - AI-powered features

### **Design System**
- **Discovery-inspired Colors**: Blue (#0066cc), Green (#00a86b), Orange (#ff6b35)
- **Inter Font**: Modern typography
- **Custom Animations**: Smooth transitions and effects
- **Responsive Grid**: Mobile-first layout system

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medrate-sa.git
   cd medrate-sa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend environment
   cd ../frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend API: http://localhost:5001
   - Frontend App: http://localhost:3000

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5001
FRONTEND_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### API Keys Required
- **OpenAI API**: For DocBot AI functionality
- **Google Maps API**: For interactive maps and location services

## 📁 Project Structure

```
medrate-sa/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Authentication & validation
│   │   └── server.js       # Main server file
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🎯 Key Features

### 🏥 **Hospital Management**
- Comprehensive database of South African hospitals
- Advanced filtering and search capabilities
- Interactive map with radius filtering
- Detailed hospital profiles with reviews

### 👨‍⚕️ **Doctor Profiles**
- Verified doctor profiles with credentials
- Specialty-based search and filtering
- Patient reviews and ratings
- Appointment booking system

### 🤖 **DocBot AI Assistant**
- Intelligent symptom analysis
- Doctor recommendations based on symptoms
- Health guidance and information
- Disclaimer for medical advice

### 📊 **Analytics & Insights**
- Hospital and doctor performance metrics
- Patient review analytics
- Usage statistics and trends
- Business intelligence dashboard

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Discovery.co.za** - Design inspiration
- **South African Healthcare System** - Data and context
- **OpenAI** - AI capabilities
- **Google Maps** - Mapping services

## 📞 Support

For support, email support@medrate-sa.co.za or create an issue in this repository.

---

**MedRate SA** - Connecting South Africans with trusted healthcare providers. 🏥✨