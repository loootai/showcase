# Dev check: serve dist/, load it in headless Chromium at desktop and 390px, light and dark.
# Saves screenshots, fails on console errors, broken images or sideways scroll.
import sys, pathlib, threading, http.server, functools
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
base = sys.argv[2] if len(sys.argv) > 2 else None
if not base:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    h = functools.partial(Quiet, directory=str(root/"dist"))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/"
fail = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for vp, size in (("desktop", {"width":1440,"height":900}), ("phone", {"width":390,"height":844})):
        for scheme in ("light", "dark"):
            ctx = b.new_context(viewport=size, color_scheme=scheme, device_scale_factor=1)
            pg = ctx.new_page(); errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("requestfailed", lambda r: errs.append("requestfailed " + r.url))
            pg.on("response", lambda r: errs.append(f"{r.status} {r.url}") if r.status >= 400 else None)
            pg.goto(base, wait_until="load"); pg.add_style_tag(content="html{scroll-behavior:auto!important}")
            # scroll to force lazy images
            h = pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0, h, 600): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(60)
            pg.wait_for_load_state("networkidle")
            broken = pg.evaluate("[...document.images].filter(i=>i.loading!=='lazy'||i.complete).filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)")
            sw = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            theme_wm = pg.evaluate("getComputedStyle(document.querySelector('.wm-dark')).display")
            pg.evaluate("window.scrollTo(0,0)")
            pg.screenshot(path=str(out/f"{vp}-{scheme}-top.png"))
            pg.screenshot(path=str(out/f"{vp}-{scheme}-full.png"), full_page=True)
            print(vp, scheme, "scrollWidth/innerWidth", sw, "dark wordmark display", theme_wm, "console errors", len(errs), "broken images", len(broken))
            if errs: fail += [f"{vp}/{scheme}: {e}" for e in errs]
            if broken: fail += [f"{vp}/{scheme}: broken {s}" for s in broken]
            if sw[0] > sw[1]: fail.append(f"{vp}/{scheme}: sideways scroll {sw}")
            if vp == "desktop" and scheme == "light":
                pg.click('.chip[data-g="Automation"]'); n = pg.evaluate("[...document.querySelectorAll('.card')].filter(c=>!c.hidden).length")
                print("filter Automation shows", n)
                pg.fill("#q", "6sense"); pg.click('.chip[data-g=""]'); m = pg.evaluate("[...document.querySelectorAll('.card')].filter(c=>!c.hidden).map(c=>c.querySelector('h3').textContent)")
                print("search 6sense ->", m)
                if m != ["looot-intent"]: fail.append("search failed")
            ctx.close()
    b.close()
print("FAIL" if fail else "OK"); [print(" ", f) for f in fail]
sys.exit(1 if fail else 0)
