from pathlib import Path
import re

html = Path("index.html").read_text(encoding="utf-8", errors="replace")

def add_path_length(match):
    tag = match.group(0)
    if "pathLength" in tag:
        return tag
    return tag.replace("<path ", '<path pathLength="1" ', 1)

html2 = re.sub(
    r'<path class="(?:path-ghost|draw-path)"[^>]*>',
    add_path_length,
    html,
)
Path("index.html").write_text(html2, encoding="utf-8")
print("pathLength count:", html2.count('pathLength="1"'))
