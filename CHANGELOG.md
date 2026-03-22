# Changelog — Trunkly

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Timezone-aware off-hours detection using IANA timezone names
- Correctly handles midnight-crossing windows (e.g. 22:00–08:00)
- Auto-creates the label in the repo if it doesn't exist yet
- Customisable comment with template variables: `{author}`, `{label}`,
  `{start}`, `{end}`, `{timezone}`, `{type}`, `{number}`, `{title}`
- `skip-authors` input to ignore bots and your own account
- `skip-label` input to skip already-triaged items
- `dry-run` mode for safe testing without side effects
- Works on both issues and pull requests
- Full test suite with edge case coverage for time range logic