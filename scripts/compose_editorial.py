#!/usr/bin/env python3
"""
Editorial Forge compositor — overlays headline/subhead/CTA text onto a scene image.

Input: JSON on stdin (or --input FILE)
Output: writes PNG to output_path, prints JSON result to stdout

Input contract:
{
  "scene_url": "https://...",
  "layout_template": {
    "headlineZone": {"x": 0.05, "y": 0.75, "w": 0.9, "h": 0.15, "align": "left"},
    "subheadZone":  {"x": 0.05, "y": 0.87, "w": 0.9, "h": 0.07, "align": "left"} | null,
    "ctaZone":      {"x": 0.05, "y": 0.93, "w": 0.4, "h": 0.05, "align": "left"} | null,
    "logoZone":     {"x": 0.75, "y": 0.05, "w": 0.20, "h": 0.08} | null,
    "typography": {
      "headlineFontFamily": "Liberation Sans",
      "headlineFontSize": 120,
      "headlineFontWeight": "bold",
      "headlineColor": "#FFFFFF",
      "headlineShadow": true,
      "subheadFontFamily": "Liberation Sans",
      "subheadFontSize": 60,
      "subheadColor": "#FFFFFF",
      "ctaFontFamily": "Liberation Sans",
      "ctaFontSize": 48,
      "ctaColor": "#FFFFFF"
    }
  },
  "headline_text": "MAUT KA KUA",
  "subhead_text": "The well of death is well hydrated." | null,
  "cta_text": "CRACK ONE OPEN" | null,
  "logo_url": "https://..." | null,
  "output_path": "/tmp/comp_abc123.png"
}
"""

import json
import sys
import os
import io
import urllib.request
import argparse
from PIL import Image, ImageDraw, ImageFont


def fetch_image(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={"User-Agent": "EditorialForge/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return Image.open(io.BytesIO(resp.read())).convert("RGBA")


def resolve_font(family: str, size: int, weight: str) -> ImageFont.FreeTypeFont:
    """Resolve a font by name. Falls back to Liberation Sans variants shipped on Railway."""
    bold = weight in ("bold", "700", "800", "900")
    candidates = []

    if "Liberation" in family or family == "default":
        if bold:
            candidates = [
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
            ]
        else:
            candidates = [
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
            ]

    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)

    # Pillow built-in bitmap font — last resort
    return ImageFont.load_default()


def parse_color(hex_color: str) -> tuple:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (r, g, b, 255)


def draw_shadow(draw: ImageDraw.ImageDraw, pos: tuple, text: str, font, offset: int = 4):
    x, y = pos
    draw.text((x + offset, y + offset), text, font=font, fill=(0, 0, 0, 180))


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Greedy word wrap to fit max_width pixels."""
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        bbox = font.getbbox(test)
        if bbox[2] - bbox[0] <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines or [text]


def draw_text_zone(
    draw: ImageDraw.ImageDraw,
    img_w: int,
    img_h: int,
    zone: dict,
    text: str,
    font: ImageFont.FreeTypeFont,
    color: tuple,
    shadow: bool = False,
):
    if not text:
        return

    x0 = int(zone["x"] * img_w)
    y0 = int(zone["y"] * img_h)
    zone_w = int(zone["w"] * img_w)
    zone_h = int(zone["h"] * img_h)
    align = zone.get("align", "left")

    lines = wrap_text(text, font, zone_w)
    line_height = font.getbbox("Ay")[3] - font.getbbox("Ay")[1]
    line_spacing = int(line_height * 0.25)

    y_cursor = y0
    for line in lines:
        bbox = font.getbbox(line)
        line_w = bbox[2] - bbox[0]

        if align == "center":
            x = x0 + (zone_w - line_w) // 2
        elif align == "right":
            x = x0 + zone_w - line_w
        else:
            x = x0

        if y_cursor + line_height > y0 + zone_h:
            break

        if shadow:
            draw_shadow(draw, (x, y_cursor), line, font)
        draw.text((x, y_cursor), line, font=font, fill=color)
        y_cursor += line_height + line_spacing


def compose(payload: dict) -> str:
    scene_img = fetch_image(payload["scene_url"])
    img_w, img_h = scene_img.size

    canvas = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
    canvas.paste(scene_img, (0, 0))

    layout = payload["layout_template"]
    typo = layout["typography"]
    draw = ImageDraw.Draw(canvas)

    # Headline
    if payload.get("headline_text") and layout.get("headlineZone"):
        font = resolve_font(
            typo.get("headlineFontFamily", "Liberation Sans"),
            typo.get("headlineFontSize", 120),
            typo.get("headlineFontWeight", "bold"),
        )
        color = parse_color(typo.get("headlineColor", "#FFFFFF"))
        draw_text_zone(
            draw, img_w, img_h,
            layout["headlineZone"],
            payload["headline_text"],
            font, color,
            shadow=typo.get("headlineShadow", True),
        )

    # Subhead
    if payload.get("subhead_text") and layout.get("subheadZone"):
        font = resolve_font(
            typo.get("subheadFontFamily", "Liberation Sans"),
            typo.get("subheadFontSize", 60),
            typo.get("subheadFontWeight", "regular"),
        )
        color = parse_color(typo.get("subheadColor", "#FFFFFF"))
        draw_text_zone(
            draw, img_w, img_h,
            layout["subheadZone"],
            payload["subhead_text"],
            font, color,
            shadow=True,
        )

    # CTA
    if payload.get("cta_text") and layout.get("ctaZone"):
        font = resolve_font(
            typo.get("ctaFontFamily", "Liberation Sans"),
            typo.get("ctaFontSize", 48),
            typo.get("ctaFontWeight", "bold"),
        )
        color = parse_color(typo.get("ctaColor", "#FFFFFF"))
        draw_text_zone(
            draw, img_w, img_h,
            layout["ctaZone"],
            payload["cta_text"],
            font, color,
            shadow=True,
        )

    # Logo
    if payload.get("logo_url") and layout.get("logoZone"):
        try:
            logo = fetch_image(payload["logo_url"])
            lz = layout["logoZone"]
            lx = int(lz["x"] * img_w)
            ly = int(lz["y"] * img_h)
            lw = int(lz["w"] * img_w)
            lh = int(lz["h"] * img_h)
            logo = logo.resize((lw, lh), Image.LANCZOS)
            canvas.paste(logo, (lx, ly), logo if logo.mode == "RGBA" else None)
        except Exception as e:
            sys.stderr.write(f"[compositor] logo fetch failed: {e}\n")

    out_path = payload["output_path"]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.convert("RGB").save(out_path, format="PNG", optimize=False)
    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="Path to JSON input file (default: stdin)")
    args = parser.parse_args()

    if args.input:
        with open(args.input) as f:
            payload = json.load(f)
    else:
        payload = json.load(sys.stdin)

    try:
        out_path = compose(payload)
        print(json.dumps({"success": True, "path": out_path}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
