# Bloks - Revolutionary File Organization Platform

<div align="center">
  <img src="public/images/logo.png" alt="Bloks Logo" height="100">
  
  <p align="center">
    <strong>Think beyond folders. Every file is a container.</strong>
  </p>
  
  <p align="center">
    A modern, real-time collaborative document editing and management platform built with Next.js 14, featuring nested file structures, rich text editing, and team collaboration capabilities.
  </p>

  <p align="center">
    <a href="#features">Features</a> |
    <a href="#getting-started">Getting Started</a> |
    <a href="#deployment">Deployment</a> |
    <a href="#tech-stack">Tech Stack</a> |
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 🚀 Features

### Core Capabilities

- **Nested File Structure** - Create infinite document hierarchies where each document can contain other documents [2](#0-1)
- **Real-time Collaboration** - Work together seamlessly with live cursors and synchronized content updates [3](#0-2)
- **Rich Text Editor** - Powered by Tiptap with extensive formatting, tables, lists, and task management [4](#0-3)
- **AI-Powered Search** - Find anything instantly across all nested files and content [5](#0-4)
- **Multi-Platform** - Access from desktop, tablet, or mobile with offline support [6](#0-5)
- **Enterprise Security** - Bank-level security with end-to-end encryption and permission controls [7](#0-6)

### Collaboration Features

- Live collaborative editing with operational transformation
- Document sharing with owner, editor, and viewer roles
- Public document publishing and discovery
- Real-time presence indicators

### Subscription Tiers

- **Free**: 25 documents, 3 collaborators
- **Pro**: 200 documents, 8 collaborators
- **Team**: Unlimited documents and collaborators

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14.2.4 with App Router [8](#0-7)
- **UI Library**: React 18 [9](#0-8)
- **Styling**: Tailwind CSS [10](#0-9)
- **UI Components**: Radix UI primitives [11](#0-10)
- **State Management**: Zustand [12](#0-11)
- **Forms**: React Hook Form + Zod validation [13](#0-12)

### Backend

- **Authentication**: NextAuth.js 5.0 (multi-provider) [14](#0-13)
- **Database**: MongoDB with Prisma ORM [15](#0-14)
- **Real-time**: Socket.io for WebSocket communication [16](#0-15)
- **Payments**: Stripe integration [17](#0-16)
- **Email**: Resend + Nodemailer [18](#0-17)

### Rich Text Editor

- **Core**: Tiptap 2.23.1 with extensive extensions [19](#0-18)
- **Features**: Tables, lists, blockquotes, links, images, task lists, text alignment [20](#0-19)

## 📦 Installation

```bash
# Clone the repository  [header-1](#header-1)
git clone https://github.com/RushikeshBhavsar3605/Bloks.git
cd Bloks

# Install dependencies  [header-2](#header-2)
npm install

# Set up environment variables (see .env.example)  [header-3](#header-3)
cp .env.example .env.local

# Run database migrations  [header-4](#header-4)
npx prisma generate
npx prisma db push

# Start development server  [header-5](#header-5)
npm run dev
```

## 🔧 Available Scripts

```
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

`package.json:5-10`

## 🌐 Environment Variables

Required environment variables:

- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` - Google OAuth credentials
- `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `GITHUB_CLIENT_ID` - GitHub OAuth credentials
- `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Email service API key

## 🏗️ Project Structure

```
bloks/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── (marketing)/       # Landing page
│   ├── (public)/          # Public document preview
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── main/             # Main app components
│   ├── marketing/        # Marketing page components
│   ├── modals/           # Modal components
│   ├── providers/        # Context providers
│   ├── search/           # Search functionality
│   ├── templates/        # Document templates
│   └── ui/               # Base UI components
├── actions/              # Server actions
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── prisma/               # Database schema
├── services/             # Business logic services
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

`page.tsx:1-12`

## 🎨 Key Features Implementation

### Marketing Site

The marketing site showcases the platform with interactive demos, including an animated company carousel and nested file structure visualization. `page.tsx:47-76`

### Authentication

Multi-provider authentication supporting email/password, Google OAuth, and GitHub OAuth with two-factor authentication support. `authentication.ts:24-50`

## 📄 License

This is a personal learning project built to demonstrate modern full-stack development practices. authentication.ts:13-14

## 🤝 Contributing

This is a portfolio project. Feel free to fork and experiment!

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
