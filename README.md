# Personal Backend Starter

Welcome to **Personal Backend Starter**, a backend project created for personal use and learning. This project allows me to explore new technologies and best practices while building a reusable and scalable backend structure. Inspired by [Mucahit Nezir's `express-starter`](https://github.com/mucahitnezir/express-starter) and [Ghostlexly's `ultimate-expressjs-starter-kit`](https://github.com/ghostlexly/ultimate-expressjs-starter-kit), this project incorporates ideas from these amazing starters, with my own adaptations and enhancements.

While it’s a personal learning project, feedback and contributions are more than welcome! 😊

---

## 🛠️ Purpose and Features

### **Why this project?**

1. **Learning and experimentation**:  
   An opportunity to explore tools and technologies I don’t frequently use, such as **Drizzle ORM**, **Redis**, **AWS S3**, **Sentry**, and **Biome**.
2. **Building a reusable starter**:  
   A modular and scalable structure, suitable for future projects.
3. **Applying best practices**:  
   Adherence to TypeScript, modern tools, and clean architecture for maintainability.

### **Core Features**

- **Authentication and Security**:  
  JWT-based authentication, session management, and middleware for rate-limiting and secure headers.
- **File Uploads and Storage**:  
  File handling with **AWS S3** for reliable storage.
- **Caching**:  
  Performance boost with **Redis** for caching.
- **Schema Validation**:  
  Strong runtime and compile-time validations with **Zod**.
- **Error Tracking**:  
  Seamless integration with **Sentry** for error monitoring and performance profiling.
- **Code Quality**:  
  Tools like **Biome**, **Prettier**, and **ESLint** to maintain consistent, clean code.
- **Email Support**:  
  Prebuilt email templates for various use cases, powered by **Nodemailer**.

---

## 📁 Project Structure

The project is designed with scalability and maintainability in mind.  

### **Core Structure**

- **`src`**: Main source code.
  - **`common`**: Shared utilities, configurations, middleware, providers, and schemas.
  - **`modules`**: Feature-specific logic (e.g., `auth`, `note`, `sample`).
- **Key Files**:
  - `app.ts`: Application initialization with middleware and configurations.
  - `index.ts`: Entry point of the application.
  - `.env`: Environment variables configuration.

### **Inspiration**

The architecture is inspired by:

- **Mucahit Nezir’s Express Starter**:  
  A minimal yet scalable starter for Express.js applications.
- **Ghostlexly’s Ultimate Express Starter Kit**:  
  A feature-packed starter with advanced implementations.

---

## ⚙️ Technologies Used

This project uses a modern stack to ensure robustness, performance, and developer productivity.

### **Core Backend Technologies**

- **Node.js and Express.js**:  
  The foundation for building and managing the server, routes, and middleware.
- **TypeScript**:  
  Enforces static typing, improving code safety and scalability.

### **Advanced Tools and Libraries**

- **Drizzle ORM**:  
  A lightweight and type-safe ORM for database management.
- **Redis**:  
  In-memory data store for caching and session management.
- **AWS S3**:  
  Reliable file storage for uploads and backups.
- **Zod**:  
  Schema validation for ensuring data integrity.
- **Nodemailer**:  
  For email handling, such as account confirmation and password reset.

### **Monitoring and Profiling**

- **Sentry**:  
  Provides error monitoring, performance profiling, and issue tracking.  
  With Sentry, unexpected crashes or performance bottlenecks are logged for quick resolution.

### **Code Quality and Formatting**

- **Biome**:  
  All-in-one linter, formatter, and code analyzer for maintaining consistent code quality.  
  It replaces tools like ESLint and Prettier while supporting TypeScript out of the box.
- **Prettier**:  
  For automated code formatting, ensuring readability and consistency.
- **ESLint**:  
  Helps enforce best practices and catch potential issues during development.

---

## 🧰 Development Tools and Setup

### **1. Installation**

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd personal-backend-starter
npm install
```

### **2. Configuration**

Set up the `.env` file:

```plaintext
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_url
AWS_S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
SENTRY_DSN=your_sentry_dsn
```

### **3. Running the Project**

- **Development Mode**:

  ```bash
  npm run dev
  ```

- **Production Mode**:

  ```bash
  npm run build && npm start
  ```

### **4. Linting and Formatting**

- Run **Biome** for linting and formatting:

  ```bash
  npm run lint
  ```

- Automatically fix linting issues:

  ```bash
  npm run lint:fix
  ```

---

## 🎯 Goals

1. **Scalability**:  
   A modular architecture that supports the addition of features with minimal refactoring.
2. **Error Monitoring**:  
   With **Sentry**, all errors and performance issues are logged for debugging and analysis.
3. **Developer Productivity**:  
   Tools like **Biome** and **Prettier** ensure a seamless development experience.
4. **Performance**:  
   **Redis** caching reduces database load, while optimized middleware enhances overall speed.
5. **Security**:  
   Secure headers, JWT authentication, and rate-limiting for a safer backend.

---

## ✨ Flexibility and Customization

This project is intended as a starting point. Feel free to:

- **Add, swap, or remove dependencies**:  
  Replace tools or libraries to suit your project’s requirements or your preferred workflow. For example:
  - Swap **Drizzle ORM** for **Prisma** or **TypeORM**.
  - Replace **Redis** with **Memcached** if needed.
- **Modify the architecture**:  
  Extend or simplify the modular design based on your project's complexity.
- **Customize middleware and configurations**:  
  Adjust middleware like rate limiting, logging, and validation to meet your needs.

The project is designed to be flexible and adaptable, so make it your own!

---

## ✨ Feedback and Contributions

This project is personal but open to improvements and suggestions. If you have feedback or ideas for enhancement:

- Open an **issue** or **pull request** on GitHub.
- Suggest new technologies or patterns that could further refine the project.

---

Thank you for exploring my **Personal Backend Starter**! 🚀
