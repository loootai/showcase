# One-off helper: compose the 1200x630 Open Graph image from the real white wordmark.
import sys, pathlib, base64
from playwright.sync_api import sync_playwright
root = pathlib.Path(sys.argv[1])
wm = base64.b64encode((root/"public/brand/looot-wordmark-white-1024.png").read_bytes()).decode()
shots = [base64.b64encode((root/f"public/img/{n}.webp").read_bytes()).decode() for n in ("looot-crm","looot-intent","looot-ads")]
html = f'''<body style="margin:0;width:1200px;height:630px;background:#0B2E22;font-family:Inter,Helvetica,Arial,sans-serif;color:#F7F8F5;position:relative;overflow:hidden">
<div style="position:absolute;inset:0;background:radial-gradient(900px 400px at 85% 0%,#0B4A35,transparent)"></div>
<img src="data:image/png;base64,{wm}" style="position:absolute;left:72px;top:64px;height:56px">
<div style="position:absolute;left:72px;top:170px;width:620px;font-size:58px;line-height:1.06;font-weight:700;letter-spacing:-1px">Open-source apps and connectors built on looot</div>
<div style="position:absolute;left:72px;top:440px;width:560px;font-size:26px;line-height:1.35;color:#a9c2b5">One key for 2,500+ data APIs. Price shown before every run.</div>
<div style="position:absolute;left:72px;bottom:56px;font-size:22px;color:#12A06A;font-weight:600">loootai.github.io/showcase</div>
<img src="data:image/webp;base64,{shots[0]}" style="position:absolute;left:700px;top:90px;width:420px;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.45);transform:rotate(3deg)">
<img src="data:image/webp;base64,{shots[1]}" style="position:absolute;left:760px;top:260px;width:420px;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.45);transform:rotate(-2deg)">
<img src="data:image/webp;base64,{shots[2]}" style="position:absolute;left:690px;top:400px;width:420px;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.45);transform:rotate(1deg)">
</body>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1200,"height":630})
    pg.set_content(html); pg.wait_for_timeout(500)
    pg.screenshot(path=str(root/"raw/og.png")); b.close()
