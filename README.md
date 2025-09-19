## Getting started

For package management, we use pnpm instead of npm or yarn. You can install it by running:

```bash
npm i -g pnpm@10.9.0
```

### 1. Clone the Project

```bash
git clone https://github.com/<owner>/<repo>.git
cd repo
```

### 2. Install Dependencies

```bash
pnpm i
```

### 3. Setup Environment

```bash
cp .env.example .env
```

### 4. Run the Project

```bash
pnpm dev
```

The project will be available at: http://localhost:3000

## Commit & Pull Request Naming Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for both pull request titles and direct commits to the main branch.
All team members — including those with permission to push directly — must adhere to these naming conventions.

### Commit types:

- `feat`: A new feature
- `impr`: An improvement to an existing feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature, but makes the code easier to read, understand, or improve
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `chore`: Other changes that don't apply to any of the above
- `revert`: Reverts a previous commit
