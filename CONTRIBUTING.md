# Contributing to Trunkly 🐘

Thanks for taking the time to contribute! Here's everything you need to get up and running.

---

## Development setup

```bash
# Prerequisites: Node.js 20+
git clone https://github.com/rafigmammadov/trunkly.git
cd trunkly
npm install
```

## Workflow

```bash
npm test               # run tests
npm run test:coverage  # tests + coverage report
npm run build          # compile TypeScript + bundle with ncc → dist/
npm run lint           # ESLint
npm run format         # Prettier
```

The `dist/` folder is committed to the repo — GitHub Actions runs it directly
without installing dependencies. Always run `npm run build` before opening a PR.

## Project structure

```
trunkly/
├── action.yml                      ← Action definition + all inputs
├── src/
│   ├── index.ts                    ← Entry point, orchestrates everything
│   ├── config.ts                   ← Parse + validate action inputs
│   ├── schedule.ts                 ← Timezone-aware off-hours detection
│   ├── labeler.ts                  ← GitHub label CRUD
│   ├── commenter.ts                ← Comment template engine
│   └── types.ts                    ← Shared TypeScript interfaces
├── __tests__/
│   ├── schedule.test.ts            ← Time range + edge case tests
│   └── commenter.test.ts           ← Template interpolation tests
├── .github/
│   ├── assets/                     ← README screenshots + banner
│   └── workflows/
│       ├── ci.yml                  ← Test on every push + PR
│       └── release.yml             ← Build dist + publish on git tag
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```

## Adding a new input

1. Add it to `action.yml` under `inputs:`
2. Parse and validate it in `src/config.ts` → `getConfig()`
3. Add the field to `TrunklyConfig` in `src/types.ts`
4. Use it in the relevant module (`src/labeler.ts`, `src/commenter.ts`, etc.)
5. Add tests in `__tests__/`
6. Document it in `README.md`

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for custom label emoji
fix: handle midnight-crossing timezone edge case
chore: update @actions/core to v1.11
docs: add Asia/Tokyo example to README
test: add coverage for off-day boundary
```

## Pull requests

- Open a PR against `main`
- The CI workflow will run tests and check that `dist/` is up to date
- One logical change per PR please
- Add or update tests for any new logic

## Releasing (maintainers only)

Bump the version in `package.json`, then:

```bash
git add package.json
git commit -m "chore: bump version to 1.x.x"
git push origin main

git tag v1.x.x
git push origin v1.x.x
# The release.yml workflow handles building dist/ and creating the GitHub Release
```

Also update the floating major tag so users on `@v1` get the update:

```bash
git tag -f v1
git push origin v1 --force
```