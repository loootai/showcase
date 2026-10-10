# One-off helper: render the real white wordmark SVG to a PNG and build the 1200x630 OG image.
import sys, pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(sys.argv[1])
svg = (root/"raw/looot-wordmark-white.svg").resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":540,"height":140}, device_scale_factor=2)
    pg.goto(svg)
    pg.wait_for_timeout(400)
    pg.screenshot(path=str(root/"raw/wm-white.png"), omit_background=True)
    b.close()
