# Portal Pals

A static, browser-based platform exploration game for start.ng. Collect 10 star gems across floating islands, then reach the portal. Includes keyboard and touch controls, a start.ng character-style handshake, guest sign-in, and a celebratory finish screen.

## Files
- `index.html` — complete ready-to-play game; no build step required.
- `cover.png` — start.ng game card artwork.
- `startng.json` — leaderboard configuration.

## Publish
Make this repository public on GitHub. Use the repository URL and the slug `portal-pals` when checking and publishing the game with start.ng. The documented flow is to call `POST https://api.start.ng/games/check` with `{"repo_url":"https://github.com/YOUR-USERNAME/portal-pals","name":"portal-pals"}`. Fix any reported errors, then call `POST https://api.start.ng/games/publish` with the same JSON. Open the returned `approve_url` and approve the game.
