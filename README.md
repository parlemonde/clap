# Clap! 🎬

A collaborative video creation platform designed for educational environments, allowing teachers and students to create videos through a structured, step-by-step workflow.

## 🎯 Overview

Clap is an innovative web application that simplifies video creation in educational settings. Teachers can create themes and scenarios, while students can collaborate in real-time to build storyboards and generate videos using a guided workflow.

## ✨ Key Features

### 🎨 **Structured Video Creation Workflow**
- **Step 1**: Choose or create scenarios based on themes
- **Step 2**: Define sequences/questions to structure the story
- **Step 3**: Create collaborative storyboards with images and plans
- **Step 4**: Pre-mounting and content organization
- **Step 5**: Add background music and audio elements
- **Step 6**: Generate and download final videos

### 🤝 **Real-Time Collaboration**
- Live collaborative editing via WebSockets
- Collaboration codes for students to join projects
- Feedback system for iterative improvements
- Session management and progress tracking

### 🎬 **Media Generation**
- Automatic video generation using MLT (MLT Multimedia Framework)
- PDF storyboard exports for planning
- Image and audio file management

### 🌍 **Internationalization**
- Multi-language support with French as primary language
- Localized content and interface elements
- Cultural adaptation for educational contexts

## 🛠 Tech Stack

### **Frontend**
- **Next.js 15 with React 19** - React-based full-stack framework
- **TypeScript** - Type-safe development
- **Radix UI** - Accessible component primitives

### **Backend**
- **Next.js API Routes** - Serverless backend functions
- **Drizzle ORM** - Type-safe database interactions
- **PostgreSQL** - Primary database for user data and projects

### **Media Processing**
- **MLT Framework** - Video editing and generation

### **Infrastructure**
- **AWS S3** - Media file storage and delivery
- **AWS DynamoDB** - Key/Value store
- **AWS Lambda** - Serverless video generation and PDF generation
- **WebSockets (Rust)** - Real-time collaboration server

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **pnpm**
- **Docker** and **Docker Compose**

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd clap
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Configuration**
Create a `.env` file with required environment variables:
```bash
# Application
APP_SECRET=1234
HOST_URL=http://localhost:3000

# Default Admin User
ADMIN_NAME=Admin
ADMIN_PASSWORD=my-s3cret-adm1n-pwd
ADMIN_EMAIL=admin@example.com

# Database
DATABASE_URL=postgresql://postgres:example@localhost:5432/clap # docker-compose url

# AWS Configuration
DYNAMODB_TABLE_NAME=clap
DYNAMODB_ENDPOINT=http://localhost:8000 # docker-compose url
AWS_REGION=local # Will store files locally instead of using AWS S3

# Email (Visit https://ethereal.email/ and create an temporary fake account)
NODEMAILER_HOST=smtp.ethereal.email
NODEMAILER_PORT=587
NODEMAILER_USER=<temporary_email_address>
NODEMAILER_PASS=<temporary_password>

# Collaboration server
COLLABORATION_SERVER_URL=ws://localhost:9000 # docker-compose url
```

4. **Start services**
```bash
docker-compose up
```

5. **Open a new terminal**

6. **Run database migrations**
```bash
pnpm db:migrate
```

7. **Start the development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Additional Services

- **WebSocket Server**: `http://localhost:9000` (for real-time collaboration)
- **PostgreSQL**: `localhost:5432`
- **DynamoDB Local**: `localhost:8000`
- **Database Studio**: `pnpm db:studio` (Drizzle Studio)

## 📁 Project Structure

```
src/
├── actions/           # Server actions for data fetching and mutations
├── app/              # Next.js app router pages and layouts
├── components/       # Reusable React components
├── contexts/         # React context providers
├── database/         # Database schemas and configuration
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization and translations
├── lib/             # Utility functions and helpers
└── styles/          # Global styles and CSS variables

server-*/            # Microservices for specialized tasks
├── server-video-generation/    # Video generation Lambda function
├── server-websockets/          # Websockets server
└── server-pdf-generation/      # PDF generation Lambda function
```

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build           # Build for production
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint issues
pnpm typecheck       # TypeScript type checking

# Database
pnpm db:migrate      # Run database migrations
pnpm db:generate     # Generate new migrations
pnpm db:studio       # Open Drizzle Studio
```

## 🚀 Deployment

### Production

This app is automatically deployed on every new commit on the main branch.

### Preview Environments

Automatic preview deployments are configured for feature branches using GitHub Actions and AWS.

## 🤝 Contributing

1. Pull the repository
2. Create a feature branch (`git checkout -b <my-name>/<my-feature>`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin <my-name>/<my-feature>`)
5. Open a Pull Request
6. Test your feature on the preview URL
7. Merge to `main` branch

## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
