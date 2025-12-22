# <img src="public/images/logo.svg" width="32" style="vertical-align:-6px;" /> Bloks - Revolutionary File Organization Platform

A modern, real-time collaborative document editing and management platform inspired by Notion built with modern web technologies, featuring nested file structures, rich text editing, and team collaboration capabilities.

![Next.js](https://img.shields.io/badge/Next.js-ffffff?style=flat&logo=nextdotjs&logoColor=000)
![Auth.js](https://img.shields.io/badge/Auth.js-ec542f?style=flat&logo=auth0&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-ffffff?style=flat&logo=socketdotio&logoColor=010101)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## 🔗 Live Project:

- Explore the live version of the project here: [Live Project](https://bloks.onrender.com)

## ✨ Features

### Real-time Collaboration Architecture

The real-time collaboration system is built with a modular Socket.io architecture:

- **Document Save Manager**: Debounced saves with 2-second intervals to optimize database writes
- **Room Manager**: Handles document subscriptions and active user presence
- **Event Handlers**: Separate modules for document operations and collaboration features
- **Type Safety**: Centralized TypeScript definitions for all socket events

This architecture supports live collaborative editing, cursor tracking, and synchronized document updates across multiple users. See `pages/api/socket/README.md` for detailed implementation.

### Advanced Authentication System

Multi-provider authentication built with NextAuth.js 5.0:

- **Providers**: Email/password, Google OAuth, and GitHub OAuth support
- **Security**: Bcrypt password hashing with salt rounds for credential authentication
- **Session Management**: Secure JWT tokens with automatic refresh
- **Email Verification**: Account verification and password reset workflows
- **Two-Factor Auth**: Optional 2FA support for enhanced security

The system uses Zod schemas for input validation and includes comprehensive error handling for all authentication flows. See `auth.config.ts` and `actions/auth/` for implementation details.

### Rich Text Editor Ecosystem

Built on TipTap 2.23.1 with extensive customizations:

- **Core Features**: Tables, lists, blockquotes, links, images, task lists, text alignment
- **Custom Extensions**: Callout blocks, collaborative editing, table node views
- **Node Components**: Custom image, code block, list, and paragraph renderers
- **Keyboard Shortcuts**: Full keyboard navigation with Mod+Shift combinations
- **Selection Handling**: Visual selection highlights and trailing node management

The editor supports real-time collaboration through Socket.io event synchronization and includes custom node views for enhanced user experience. See `components/templates/simple-editor-no-toolbar.tsx` and `extensions/` for implementation.

### Full-Text Search System

MongoDB-based search architecture with comprehensive filtering:

- **Real-time Search**: Instant results as you type across all accessible documents
- **Advanced Filters**: Search by content, title, owner, collaboration status
- **Scope Control**: Search personal documents, shared documents, or public content
- **Permission Aware**: Results filtered by user access permissions
- **Modal Interface**: Keyboard-accessible search modal with keyboard shortcuts

The search system uses MongoDB text indexes with case-insensitive matching and includes debounced input for performance optimization. See `actions/search/advanced-search.ts` and `components/search/` for implementation.

### Nested Document Architecture

Infinite hierarchical document structure where every document can contain other documents:

- **Tree Structure**: Dynamic document tree with drag-drop organization
- **Parent-Child Relations**: Database-level relationships with cascade operations
- **Breadcrumb Navigation**: Automatic breadcrumb generation for nested paths
- **Recursive Operations**: Bulk operations on document hierarchies (archive, restore, delete)
- **Visual Indicators**: Icons and indentation showing document relationships

The system uses recursive database queries and maintains referential integrity across all nested operations. See `components/main/document-list/document-tree.tsx` for UI implementation.

### Subscription & Billing Management

Stripe-integrated subscription system with three tiers:

- **Free Plan**: 25 documents, 3 publications, 2 collaborators per document
- **Pro Plan**: 200 documents, 15 publications, 8 collaborators (₹499/month)
- **Team Plan**: Unlimited documents, publications, and collaborators (₹999/month)
- **Usage Tracking**: Real-time monitoring of document counts and limits
- **Upgrade Flows**: Contextual upgrade prompts when limits are reached

The billing system includes webhook handling for subscription events and customer portal integration. See `data/pricing.ts` and `components/main/billing/` for implementation.

### Collaboration & Sharing System

Comprehensive document sharing with granular permissions:

- **Role-Based Access**: Owner, Editor, Viewer roles with specific permissions
- **Invitation System**: Email-based collaboration invites with verification
- **Public Publishing**: Share documents publicly with optional password protection
- **Real-time Presence**: Live cursors and user presence indicators
- **Activity Tracking**: Audit logs for document access and modifications

The collaboration system integrates with the real-time architecture for instant permission updates. See `actions/collaborators/` and `services/collaborator-service.ts` for implementation.

### Document Management & Organization

Full lifecycle document management with advanced organization:

- **Starred Documents**: Favorite documents for quick access
- **Trash System**: Soft delete with restore capabilities
- **Bulk Operations**: Multi-select operations across document sets
- **Export Options**: Document export capabilities (implementation varies by subscription tier)
- **Metadata Tracking**: Creation dates, last edited, author information

The system maintains document relationships during moves and operations. See `components/main/trash-box/` and `actions/documents/` for implementation.

### Theme & Accessibility System

Comprehensive theming and accessibility support:

- **Dark/Light Mode**: System-aware theme switching with persistence
- **Responsive Design**: Mobile-first design with tablet and desktop optimizations
- **Keyboard Navigation**: Full keyboard accessibility for all features
- **Screen Reader Support**: ARIA labels and semantic HTML structure
- **Focus Management**: Proper focus handling in modals and complex interactions

The theme system uses Tailwind CSS with CSS variables for smooth transitions. See `components/providers/theme-provider.tsx` for implementation.

### Marketing Site

The marketing site showcases the platform with interactive demos, including an animated company carousel and nested file structure visualization.

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14.2.4 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Backend

- **Authentication**: NextAuth.js 5.0 (multi-provider)
- **Database**: MongoDB with Prisma ORM
- **Real-time**: Socket.io with modular architecture for scalable WebSocket communication
- **Payments**: Stripe integration
- **Email**: Resend + Nodemailer

### Rich Text Editor

- **Core**: Tiptap 2.23.1 with extensive extensions
- **Features**: Tables, lists, blockquotes, links, images, task lists, text alignment

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

## 📁 Project Structure

```
bloks/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── auth/          # Login/register pages
│   │   └── verify/        # Email verification
│   ├── (main)/            # Main application
│   │   ├── billing/       # Subscription management
│   │   ├── documents/     # Document editor and view
│   │   ├── explore/       # Browse templates
│   │   ├── library/       # User's document library
│   │   ├── settings/      # User settings
│   │   └── starred/       # Starred documents
│   ├── (marketing)/       # Landing page
│   ├── (public)/          # Public document preview
│   └── api/               # API routes
│       └── auth/          # NextAuth configuration
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── main/             # Main app components
│   │   ├── billing/      # Billing UI components
│   │   ├── collaborators/ # Collaboration UI
│   │   ├── document-list/ # Document listing
│   │   ├── settings/      # Settings UI
│   │   ├── trash-box/     # Trash management
│   │   ├── editor.tsx     # TipTap editor wrapper
│   │   ├── navbar.tsx     # Top navigation bar
│   │   └── toolbar.tsx    # Editor toolbar
│   ├── marketing/        # Marketing page components
│   ├── modals/           # Modal components
│   │   ├── collaborator-modal.tsx
│   │   ├── confirm-modal.tsx
│   │   ├── settings-modal.tsx
│   │   ├── trash-modal.tsx
│   │   └── upgrade-alert-modal.tsx
│   ├── providers/        # Context providers
│   ├── search/           # Search functionality
│   ├── templates/        # Document templates
│   └── ui/               # Base UI components
├── actions/              # Server actions
│   ├── collaborators/    # Collaborator management
│   ├── documents/        # Document CRUD operations
│   ├── search/           # Search actions
│   ├── users/            # User management
│   ├── login.ts          # Login action
│   ├── register.ts       # Registration action
│   └── reset.ts          # Password reset
├── hooks/                # Custom React hooks
│   ├── use-advanced-search.ts  # Search functionality
│   ├── use-collaborators.ts    # Collaborator state
│   ├── use-current-user.ts     # User session
│   ├── use-save-status.tsx     # Document save status
│   └── use-settings.tsx        # Settings modal
├── lib/                  # Utility functions
│   ├── email-templates/  # Email HTML templates
│   ├── toasts/          # Toast notification helpers
│   ├── auth-server.ts   # Server-side auth utilities
│   ├── client-socket.ts # Socket.io client setup
│   ├── db.ts            # Prisma client
│   ├── mail.ts          # Email sending
│   ├── tiptap-utils.ts  # Editor utilities
│   └── tokens.ts        # Auth token generation
├── pages/                # Pages Router (for Socket.io)
│   └── api/
│       ├── socket/       # Socket.io handlers
│       │   ├── auth/     # Socket authentication
│       │   ├── collaborators/ # Collaborator events
│       │   │   └── invite.ts
│       │   ├── documents/ # Document events
│       │   │   ├── [documentId]/
│       │   │   ├── access.ts
│       │   │   ├── index.ts
│       │   │   └── trash.ts
│       │   ├── handlers/ # Event processing modules
│       │   │   ├── collaboration-events.ts
│       │   │   └── document-events.ts
│       │   ├── managers/ # State and save management
│       │   │   ├── document-save-manager.ts
│       │   │   └── room-manager.ts
│       │   ├── io.ts    # Socket initialization
│       │   ├── socket-manager.ts
│       │   └── types.ts # Socket event definitions
│       └── webhook/      # External webhooks
│           └── stripe/   # Stripe payment webhooks
├── services/             # Business logic services
│   ├── collaborator-service.ts
│   ├── document-service.ts
│   └── socket-service.ts
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema definition
├── types/                # TypeScript type definitions
│   └── shared.ts         # Shared types
└── public/               # Static assets
```

## 🚀 Deployment

This application cannot be deployed on Vercel as it uses `Socket.io`, which requires a persistent server, and Vercel is a serverless platform. However, you can deploy it on other platforms that support long-lived connections, such as Render or similar platforms.

Here's how you can deploy on Render:

1. Push your code to GitHub
2. Import your repository in Render
3. Add all environment variables
4. Deploy!

## 👤 Author

Rushikesh Bhavsar

- GitHub: [@RushikeshBhavsar3605](https://github.com/RushikeshBhavsar3605)

  <a href="https://github.com/RushikeshBhavsar3605">
  <img src="https://avatars.githubusercontent.com/u/129877176?v=4" alt="GitHub Profile" style="width: 45px; height: 45px; border-radius: 50%;" />
  </a>

## 🙏 Acknowledgments

- Inspired by Notion's amazing collaborative management platform
- Built using modern web technologies

---

⭐ If you like this project, please give it a star on GitHub!
