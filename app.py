import streamlit as st
import streamlit.components.v1 as components
import os

# Configure Streamlit Page
st.set_page_config(
    page_title="SAFEZONE 360 — Smart Road Safety Command System",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit Default Header, Padding, & Footer for Seamless Fullscreen App Experience
hide_streamlit_style = """
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {
        padding-top: 0rem;
        padding-bottom: 0rem;
        padding-left: 0rem;
        padding-right: 0rem;
        max-width: 100%;
    }
    iframe {
        border: none;
        width: 100vw;
        height: 100vh;
    }
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# Path to our local assets
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(CURRENT_DIR, "index.html")
css_path = os.path.join(CURRENT_DIR, "styles.css")
js_path = os.path.join(CURRENT_DIR, "script.js")

# Read components
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Inline CSS & JS into self-contained HTML bundle for Streamlit Cloud deployment
inlined_html = html_content.replace(
    '<link rel="stylesheet" href="styles.css">',
    f'<style>{css_content}</style>'
).replace(
    '<script src="script.js"></script>',
    f'<script>{js_content}</script>'
)

# Render complete 60FPS interactive prototype inside Streamlit component
components.html(inlined_html, height=1000, scrolling=True)
