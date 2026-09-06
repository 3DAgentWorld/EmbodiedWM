# World Models for Embodied Intelligence — Project Page

Static academic project page for **World Models for Embodied Intelligence: From Plausible to Controllable to Actionable**.

The page is dependency-free and can be served directly by GitHub Pages from the repository root.

The paper library is derived from citations in the active survey body. Its primary groups follow the
Plausible, Controllable, and Actionable subsections; the Four Improvement Loops and Embodiments sections
provide cross-cutting tags. `WM_Corpus_200.csv` is not used by the website.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Push this directory to a GitHub repository using the `main` branch.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. The included workflow publishes the page after every push to `main`.

The page contains no external runtime dependencies or remote assets. Its visual framework is drawn with HTML, CSS, and a small local SVG mark so it remains portable.
