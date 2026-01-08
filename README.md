
# NullBox CTF Platform

<div align="center">

![NullBox Platform](https://media.discordapp.net/attachments/1145383617637146705/1199321523317768222/standard_2.gif?ex=65c21966&is=65afa466&hm=3d98d257270d49488a0710609657688220914440537233918076634567290632&=)

**An advanced, container-based Capture The Flag (CTF) platform built for dynamic and immersive security challenges.**

Developed by **NullChapter** of **VIT-AP**.

</div>

---

## 🚀 Overview

NullBox is a cutting-edge CTF platform designed to host and manage security competitions. It supports a wide range of challenge categories including Web, Pwn, Reverse Engineering, and Cryptography. Unique to NullBox is its **On-Demand Container Architecture**, allowing participants to spawn isolated, private instances of challenges ensuring a fair and conflict-free environment.

## ✨ Key Features

- **🏆 Dynamic Scoring System**: Real-time scoreboard with dynamic point adjustments.
- **🐳 On-Demand Containers**: Automatically spins up Docker containers for specific challenges (e.g., Pwn, Web) per team.
- **👥 Team Management**: Create teams, generate join codes, and manage members.
- **🔐 Secure Authentication**: Registration Number based login system custom-tailored for university events.
- **🎨 Modern UI/UX**: Built with Next.js 16, Tailwind CSS v4, and Framer Motion for a smooth, "hacker-aesthetic" experience.
- **📊 Admin Dashboard**: specialized controls for challenge management and user monitoring.

## 🛠️ Technology Stack

NullBox leverages a modern web stack to ensure performance and scalability:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [SQLite](https://sqlite.org/) (via [Prisma ORM](https://www.prisma.io/) & [LibSQL](https://turso.tech/libsql))
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Container Management**: [Dockerode](https://github.com/apocas/dockerode) (Node.js Docker API)
- **Authentication**: JWT (JOSE) & Bcrypt

## ⚙️ prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** (Required for spawning challenge containers)
- **Git**

## 📥 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/NullChapter/NullBox.git
    cd NullBox
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You can copy the structure from an example or configure as needed:
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your_super_secret_key"
    ```

4.  **Database Setup**
    Run migrations to set up the SQLite database:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 📦 Docker Container Setup

For challenges that require isolation (like Pwn or complex Web tasks), NullBox uses Docker.

1.  Ensure the **Docker Daemon** is running on your host machine.
2.  Challenge images must be built and tagged to match the `imageName` defined in the challenge database entry.
3.  The platform communicates with the local Docker socket to spawn containers.

## 🤝 Contributing

This project is maintained by **NullChapter, VIT-AP**. Contributions are welcome!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://instagram.com/nullchapter">NullChapter</a>
</p>
