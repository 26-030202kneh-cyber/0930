import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(
    page_title="벽돌 깨기 게임",
    page_icon="🧱",
    layout="centered"
)

BASE_DIR = Path(__file__).parent

html = (BASE_DIR / "index.html").read_text(encoding="utf-8")
css = (BASE_DIR / "style.css").read_text(encoding="utf-8")
js = (BASE_DIR / "script.js").read_text(encoding="utf-8")

html = html.replace(
    '<link rel="stylesheet" href="style.css">',
    f"<style>{css}</style>"
)

html = html.replace(
    '<script src="script.js"></script>',
    f"<script>{js}</script>"
)

components.html(
    html,
    height=850,
    scrolling=False
)
