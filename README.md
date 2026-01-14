# pix2fact.github.io

This repository contains a lightweight, research-style project webpage template (static HTML/CSS/JS).

## Structure

- `index.html`: Title/authors/teaser/introduction + leaderboard section
- `styles.css`: Page styling (clean, research-website look)
- `script.js`: Mock leaderboard data + filtering/search/sorting
- `assets/`: Placeholder images (logo/teaser/favicon)

## Local preview

You can preview locally with any static file server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Replace placeholders

- Replace the title, author names, and author links in `index.html`
- Replace the teaser figure in `assets/teaser.svg`
- Replace `MOCK_RESULTS` in `script.js` with real leaderboard data
