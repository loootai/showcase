# looot showcase

One page that lists everything built on [looot](https://looot.ai), with a screenshot, the price of the product each tool replaces, the list-price cost of a typical run, a command to try it and a link to the repo.

Live at https://loootai.github.io/showcase/

looot gives an AI agent one key and one prepaid balance for 2,500+ data API endpoints. Every repo here is open source and built on it.

## Add a repo

All content lives in one file, `data/projects.json`. Add one entry to `projects` and run `npm run build`. The cards, the filter chips, the counts, the comparison table, the description and the sitemap come from that file. Nothing else needs editing.

```json
{
  "id": "looot-example",
  "name": "looot-example",
  "title": "looot example",
  "repo": "https://github.com/loootai/looot-example",
  "kind": "connector",
  "group": "Utilities",
  "summary": "The repo's one-line GitHub description.",
  "command": "npm install looot-example",
  "commandLabel": "Install",
  "tests": 12,
  "image": "img/looot-example.webp"
}
```

- `kind` is `app`, `alternative` or `connector`.
- `group` is one of `Apps`, `Open-source alternatives`, `Agent tools`, `Automation`, `Utilities`, `SDKs and frameworks`, `Editors and CI`, `Lists and examples`. The build fails on any other value. To add a group, add it to `GROUP_ORDER` in `scripts/build.mjs`.
- `command`, `commandLabel`, `tests`, `release`, `image`, `live` are optional.
- Only an `alternative` appears in the "Replace vs cost" table. It needs `replaces`, `replacesPrice` and `costOfRun`. `replacesPrice.basis` is `listed` (a public price page), `estimate` (a third-party figure) or `none` (no public price), and `replacesPrice.note` says where the figure came from and when it was read.
- Copy figures from the repo's own README. Do not round them or add one that the README does not give.

### Images

Screenshots are 960x600 WebP, about 20 to 40 KB each, in `public/img/`. Crop a tall screenshot to the top 5:8 and resize it to 960 wide, for example `magick shot.png -gravity north -crop 1280x800+0+0 +repage -resize 960x600! -quality 80 public/img/name.webp`. Cards load them lazily.

## Build and check

No dependencies. Node 20 or newer.

```bash
npm run build            # data/projects.json + src/ + public/ -> dist/
npm run check            # every local link and image in dist/index.html exists
npm run check:external   # also requests every external link
npm run scan             # leak scan before a commit or push
python3 scripts/verify.py ../shots   # needs Playwright: loads dist/ at 1440px and 390px, light and dark, saves screenshots, fails on console errors, broken images or sideways scroll
```

Turn on the hooks once per clone: `git config core.hooksPath .githooks`.

## Publish

Pushing to `main` runs `.github/workflows/pages.yml`: leak scan, build, link check, then deploy `dist/` to GitHub Pages.

## Brand files

`public/brand/` holds copies of the looot mark and wordmark from the looot dashboard. The white wordmark is a render of the original SVG. Do not redraw them.

## Numbers and prices

Third-party prices are what each repo's README recorded on the date shown there, and a figure from a review site is labelled as an estimate. Run costs are the list-price figures in each README. They are catalog quotes, not receipts from real runs. Screenshots show demo data.

## Licence

MIT, copyright looot. See `LICENSE`.
