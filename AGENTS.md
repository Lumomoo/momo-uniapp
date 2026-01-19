# Repository Guidelines

## Project Structure & Module Organization
- `build/` holds Vite plugins and build-time constants; `scripts/` contains git hook helpers.
- `src/` is the application root: `api/`, `components/`, `hooks/`, `pages/`, `store/`, `utils/`, `static/`.
- Entry and config artifacts live in `src/main.ts`, `src/App.vue`, `src/manifest.json`, `src/pages.json`, `src/permission.ts`, and `src/uni.scss`.
- `types/` contains global TypeScript declarations used by auto-imports and components.
- Root configs include `vite.config.ts`, `uno.config.ts`, `eslint.config.js`, `stylelint.config.js`, and `.editorconfig`.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies (pnpm is required by `preinstall`).
- `pnpm dev:h5`: start the H5 dev build.
- `pnpm dev:mp-weixin`: start the Weixin mini program dev build.
- `pnpm build:h5` / `pnpm build:mp-weixin`: build for test mode.
- `pnpm build:h5-prod` / `pnpm build:mp-weixin-prod`: production mode builds.
- `pnpm type-check`: run `vue-tsc` type checking with no emit.
- `pnpm eslint` / `pnpm stylelint`: fix lint issues in code and styles.

## Coding Style & Naming Conventions
- Follow `.editorconfig`: UTF-8, 2-space indentation, LF endings, trim trailing whitespace.
- Use TypeScript and Vue 3 SFCs consistent with existing patterns in `src/`.
- Keep names descriptive and aligned with current folders (e.g., `pages/tab/home/index.vue`).
- Run ESLint and Stylelint before commits; lint-staged enforces this on staged files.

## Testing Guidelines
- No dedicated unit test runner is configured in `package.json`.
- Use `pnpm type-check`, `pnpm eslint`, and `pnpm stylelint` as the baseline quality gates.
- If you add a test framework, document the runner and naming patterns in this file.

## Commit & Pull Request Guidelines
- Commit messages must match: `type(scope): subject` with a 1-50 char subject.
- Allowed types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `types`, `wip`, `release`.
- Use `pnpm cz` to generate compliant commits (enforced by `scripts/verifyCommit.js`).
- PRs should include a clear summary, linked issues, and screenshots for UI changes. Note the commands you ran (e.g., `pnpm type-check`).

## Configuration & Environment
- Required engines: Node >= 18 and pnpm >= 7.30.
- Environment files: `.env`, `.env.development`, `.env.production` for mode-specific config.
