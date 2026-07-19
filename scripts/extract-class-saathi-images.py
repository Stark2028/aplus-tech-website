"""Extract embedded images from the Class Saathi brochure, per page, to a
review directory. Run, eyeball the output, then convert keepers to webp.

Usage:
  python scripts/extract-class-saathi-images.py extract <pdf> <outdir>
  python scripts/extract-class-saathi-images.py convert <src> <dest.webp> [max_width]
"""
import sys
from pathlib import Path
from pypdf import PdfReader
from PIL import Image


def extract(pdf_path: str, outdir: str) -> None:
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(pdf_path)
    for pno, page in enumerate(reader.pages, start=1):
        for ino, img in enumerate(page.images):
            name = f"p{pno:02d}_{ino:02d}_{img.name}".replace("/", "_")
            path = out / name
            path.write_bytes(img.data)
            try:
                with Image.open(path) as im:
                    print(f"{name}: {im.size[0]}x{im.size[1]} {im.mode}")
            except Exception as e:  # unreadable/exotic stream — note and move on
                print(f"{name}: unreadable ({e})")


def convert(src: str, dest: str, max_width: int = 1200) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
        if im.width > max_width:
            im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
        im.save(dest, "WEBP", quality=82, method=6)
        print(f"{dest}: {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    if sys.argv[1] == "extract":
        extract(sys.argv[2], sys.argv[3])
    else:
        convert(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 1200)
