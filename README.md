# 🐊 Gator – RSS Feed Aggregator CLI

Gator is a simple command-line application that allows you to register users,
add RSS feeds, follow feeds, collect posts from those feeds, and browse the
latest posts from your followed feeds.

The project is built with:
- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM

It is designed as a small developer-friendly CLI tool to practice database
work, background jobs (aggregation), and CLI command handling.

---

## ⚙️ Requirements

Before running the project, make sure you have:

- Node.js (v18 or later)
- npm
- PostgreSQL

---

## 🛠️ Setup

1. Install dependencies

```bash
npm install

## 🛠️ Database setup

Create your database and set your connection string.

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://username:password@localhost:5432/gator

Run database migrations:

npx drizzle-kit migrate
▶️ Running the CLI

All commands are run using:

npm run start <command> [...args]

Example:

npm run start register zain
🧾 CLI Commands

Below is the list of all available commands in the Gator CLI.

Commands marked with 🔐 require the user to be logged in.

👤 Authentication
Register a new user
npm run start register <username>

Creates a new user.

Login
npm run start login <username>

Logs in as an existing user.

🗄️ Database
Reset the database
npm run start reset

Deletes all data and recreates the database.

👥 Users
List all users
npm run start users

Displays all registered users.

📰 Feeds
🔐 Add a new feed
npm run start addfeed "<feed name>" "<feed url>"

Adds a new RSS feed and assigns it to the logged-in user.

List all feeds
npm run start feeds

Shows all feeds in the system.

⭐ Following feeds
🔐 Follow a feed
npm run start follow "<feed url>"

Follow an existing feed using its URL.

🔐 List followed feeds
npm run start following

Displays the feeds followed by the current user.

🔐 Unfollow a feed
npm run start unfollow "<feed url>"

Stops following a feed.

🔍 Browse posts
🔐 Browse posts from followed feeds
npm run start browse

Displays posts collected from feeds followed by the current user.

🔄 Aggregator
Run the feed aggregator
npm run start agg <interval>

Collects posts from all feeds periodically.

Examples:

npm run start agg 10s
npm run start agg 1m
npm run start agg 5m

📝 Notes

You must register and login before using commands marked with 🔐.

The aggregator should be running in a separate terminal while you browse posts.

Feeds are fetched over the network and may fail if the remote server is slow or unreachable.