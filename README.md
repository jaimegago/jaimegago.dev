# jaimegago.dev

Source for [jaimegago.dev](https://jaimegago.dev/). Hugo + a custom single-author
theme at `themes/jaime`, deployed to GitHub Pages from `main` by the workflow
at `.github/workflows/hugo.yml`.

## Prerequisites

- Hugo **extended** v0.128 or newer (`brew install hugo`)
- Go (only required if you want to re-generate the OG base PNG; optional)

## Run locally

```sh
git clone git@github.com:jaimegago/jaimegago.dev-web.git
cd jaimegago.dev-web
make dev
```

Then open <http://localhost:1313>.

## Publish

Push to `main`. GitHub Actions builds with `hugo --minify` and deploys to
GitHub Pages. The custom domain `jaimegago.dev` is served from `static/CNAME`.

## Add a post

```sh
make new-post SLUG=my-new-post TAG=Essay
```

Writes a draft to `content/writing/YYYY-MM-DD-my-new-post.md`. Flip
`draft: false` when ready; the next push publishes it.

See `DECISIONS.md` for notes on the choices made while scaffolding.
