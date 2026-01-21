# GEMINI Project Context: uniapp-vue3-template

## Project Overview

This project is a comprehensive template for rapid development of H5 and WeChat Mini Programs using the `uni-app` framework. It is built on a modern tech stack including Vue 3, Vite, and TypeScript.

The primary goal of this template is to provide a well-structured, feature-rich starting point for team collaboration.

### Key Technologies:
- **Framework**: `uni-app` with Vue 3
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Pinia
- **UI Libraries**: The project is configured to use both `TuniaoUI` and `uview-plus`. It appears to be transitioning towards or primarily using `TuniaoUI`, which is included as a local directory, while `uview-plus` is a package dependency.
- **Styling**: `UnoCSS` is used for atomic CSS, providing a utility-first styling approach.
- **Linting**: ESLint and Stylelint are integrated for code and style consistency.
- **Routing**: `uni-app`'s file-based routing (`pages.json`) is used, with added navigation guards for permission control (`src/permission.ts`).

## Building and Running

The project uses `pnpm` as its package manager.

### Installation
```bash
# Install dependencies
pnpm install
```

### Development
```bash
# Start the development server for H5
pnpm dev:h5

# Start the development server for WeChat Mini Program
pnpm dev:mp-weixin
```

### Building for Production
The build process is configured for different environments.
```bash
# Build for H5 (Test Environment)
pnpm build:h5

# Build for H5 (Production Environment)
pnpm build:h5-prod

# Build for WeChat Mini Program (Test Environment)
pnpm build:mp-weixin

# Build for WeChat Mini Program (Production Environment)
pnpm build:mp-weixin-prod
```

### Type Checking
```bash
# Run the TypeScript compiler to check for type errors
pnpm type-check
```

## Development Conventions

### Code Style and Linting
- The project uses **ESLint** for TypeScript/JavaScript linting and **Stylelint** for CSS/SCSS linting.
- Linting is automatically run on staged files before each commit using `lint-staged` and a `pre-commit` hook (configured in `package.json`).
- To manually run the linters and fix issues:
  ```bash
  # Lint and fix script files
  pnpm eslint

  # Lint and fix style files
  pnpm stylelint
  ```

### Commit Messages
- The project enforces **Conventional Commits**.
- To make a commit, use the `pnpm cz` command, which launches an interactive prompt to guide you through creating a compliant commit message.
- A `commit-msg` git hook is in place to verify the commit message format.

### Directory Structure
The project follows a modular structure to keep the codebase organized:
- `src/api`: For API endpoint definitions and request functions.
- `src/components`: For shared, reusable Vue components.
- `src/pages`: Contains the application's pages, organized by main package and sub-packages.
- `src/store`: Pinia stores for global state management.
- `src/utils`: Utility functions, including request handling, authentication, etc.
- `tuniao-ui`: Contains the source for the TuniaoUI component library.
- `uno.config.ts`: Configuration for UnoCSS.
- `vite.config.ts`: Main Vite configuration file.
