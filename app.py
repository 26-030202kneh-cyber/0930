import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(
    page_title="벽돌 깨기 게임",
    page_icon="🧱",
    layout="centered",
    initial_sidebar_state="collapsed"
)

BASE_DIR = Path(__file__).parent

html_path = BASE_DIR / "index.html"
css_path = BASE_DIR / "style.css"
js_path = BASE_DIR / "script.js"

html = html_path.read_text(encoding="utf-8")
css = css_path.read_text(encoding="utf-8")
js = js_path.read_text(encoding="utf-8")

html = html.replace(
    '<link rel="stylesheet" href="style.css">',
    f"<style>\n{css}\n</style>"
)

html = html.replace(
    '<script src="script.js"></script>',
    f"<script>\n{js}\n</script>"
)

components.html(
    html,
    height=850,
    scrolling=False
)
