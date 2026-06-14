# feedback.py
"""
Capture feedback: a shutter sound, a camera icon just inside the top-left corner
of the minimap region, and an outline of the exact captured area. Always-on;
the overlays auto-hide after NOTIFICATION_DURATION_MS.
"""
import io
import os
import wave
import tempfile
import threading
import tkinter as tk

import numpy as np

from config import get_map_coordinates

try:
    import winsound
    _HAS_WINSOUND = True
except ImportError:
    _HAS_WINSOUND = False

# --- Customization -----------------------------------------------------------
NOTIFICATION_DURATION_MS = 1000     # how long the icon + outline stay on screen
CAMERA_SIZE = 50                    # camera body width in px (frame scales with it)
CAMERA_COLOR = "#FFC400"            # icon color
TRANSPARENT_KEY = "#010101"         # rendered fully see-through
SOUND_VOLUME = 0.9                  # 0.0 - 1.0
ICON_CORNER = "top-left"            # top-left / top-right / bottom-left / bottom-right
MAP_ICON_MARGIN = 15                # px inset from the map corner (negative = outside)
SHOW_CAPTURE_RECT = True            # draw the captured-region outline
RECT_COLOR = "#FFC400"              # outline color
RECT_WIDTH = 3                      # outline thickness in px
# Fallback icon placement (used only if the minimap region isn't configured):
ICON_GAP = 12
TEXT_CLEARANCE = 230
# -----------------------------------------------------------------------------

_shutter_path = None


def _build_shutter_wav(sample_rate=44100):
    """Synthesize a short two-click camera shutter as WAV bytes."""
    rng = np.random.default_rng(0)

    def click(duration_ms, decay):
        n = int(sample_rate * duration_ms / 1000)
        noise = rng.uniform(-1.0, 1.0, n)
        envelope = np.exp(-np.linspace(0.0, decay, n))
        return noise * envelope

    gap = np.zeros(int(sample_rate * 0.05))
    signal = np.concatenate([click(25, 4.5), gap, click(45, 5.5)])

    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak
    signal = (signal * SOUND_VOLUME * 32767).astype(np.int16)

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(signal.tobytes())
    return buffer.getvalue()


def _ensure_shutter_file():
    """Write the shutter WAV to a temp file once; return its path."""
    global _shutter_path
    if _shutter_path and os.path.exists(_shutter_path):
        return _shutter_path
    path = os.path.join(tempfile.gettempdir(), "squadmortar_shutter.wav")
    with open(path, "wb") as f:
        f.write(_build_shutter_wav())
    _shutter_path = path
    return path


def play_shutter_sound():
    """Play the shutter asynchronously, with a guaranteed-audible fallback."""
    if not _HAS_WINSOUND:
        return
    try:
        path = _ensure_shutter_file()
        winsound.PlaySound(path, winsound.SND_FILENAME | winsound.SND_ASYNC)
    except Exception:
        try:
            threading.Thread(target=lambda: winsound.Beep(1200, 60), daemon=True).start()
        except Exception:
            pass


class CaptureNotification:
    """Camera icon at a map corner + an outline of the captured region."""

    def __init__(self, settings):
        self.settings = settings
        self.icon_w = 0
        self.icon_h = 0
        self.pad = 0
        self._hide_id = None

        # --- icon window ---
        self.window = self._make_overlay_window()
        self.canvas = tk.Canvas(self.window, bg=TRANSPARENT_KEY,
                                highlightthickness=0, bd=0)
        self.canvas.pack()
        self._build_icon()
        self.window.withdraw()

        # --- capture-rectangle window ---
        self.outline = self._make_overlay_window()
        self.outline_canvas = tk.Canvas(self.outline, bg=TRANSPARENT_KEY,
                                        highlightthickness=0, bd=0)
        self.outline_canvas.pack()
        self.outline.withdraw()

    def _make_overlay_window(self):
        w = tk.Toplevel()
        w.overrideredirect(True)
        w.wm_attributes("-topmost", True)
        w.wm_attributes("-disabled", True)
        w.wm_attributes("-toolwindow", True)
        w.configure(bg=TRANSPARENT_KEY)
        w.wm_attributes("-transparentcolor", TRANSPARENT_KEY)
        return w

    def _round_rect(self, x0, y0, x1, y1, r, **kw):
        pts = [
            x0 + r, y0, x1 - r, y0, x1, y0, x1, y0 + r,
            x1, y1 - r, x1, y1, x1 - r, y1, x0 + r, y1,
            x0, y1, x0, y1 - r, x0, y0 + r, x0, y0,
        ]
        return self.canvas.create_polygon(pts, smooth=True, **kw)

    def _build_icon(self):
        color, bg = CAMERA_COLOR, TRANSPARENT_KEY
        cam = CAMERA_SIZE
        F = int(cam * 1.85)
        t = max(int(cam * 0.13), 5)
        arm = int(F * 0.30)
        pad = t
        W = H = F + pad * 2
        self.icon_w, self.icon_h, self.pad = W, H, pad

        self.canvas.config(width=W, height=H)
        self.canvas.delete("all")

        x0, y0, x1, y1 = pad, pad, pad + F, pad + F
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

        rc = dict(width=t, fill=color, capstyle=tk.ROUND, joinstyle=tk.ROUND)
        self.canvas.create_line(x0, y0 + arm, x0, y0, x0 + arm, y0, **rc)
        self.canvas.create_line(x1 - arm, y0, x1, y0, x1, y0 + arm, **rc)
        self.canvas.create_line(x0, y1 - arm, x0, y1, x0 + arm, y1, **rc)
        self.canvas.create_line(x1 - arm, y1, x1, y1, x1, y1 - arm, **rc)

        bw, bh = cam, int(cam * 0.66)
        cyb = cy + bh * 0.08
        bx0, by0 = cx - bw / 2, cyb - bh / 2
        bx1, by1 = cx + bw / 2, cyb + bh / 2
        r = bh * 0.22

        hx0 = bx0 + bw * 0.14
        self._round_rect(hx0, by0 - bh * 0.22, hx0 + bw * 0.26, by0 + 2,
                         bh * 0.12, fill=color, outline="")
        self._round_rect(bx0, by0, bx1, by1, r, fill=color, outline="")

        lr = bh * 0.40
        ir = lr * 0.52
        self.canvas.create_oval(cx - lr, cyb - lr, cx + lr, cyb + lr, fill=color, outline="")
        self.canvas.create_oval(cx - ir, cyb - ir, cx + ir, cyb + ir, fill=bg, outline="")

        fr = max(int(bw * 0.05), 2)
        fx, fy = bx1 - bw * 0.16, by0 + bh * 0.18
        self.canvas.create_oval(fx - fr, fy - fr, fx + fr, fy + fr, fill=color, outline="")

    def _region(self):
        try:
            r = get_map_coordinates()
        except Exception:
            return None
        if not r or all(v == 0 for v in r.values()):
            return None
        if r["right"] <= r["left"] or r["bottom"] <= r["top"]:
            return None
        return r

    def _corner_position(self, region):
        m = MAP_ICON_MARGIN
        F = self.icon_w - 2 * self.pad
        left, top = region["left"], region["top"]
        right, bottom = region["right"], region["bottom"]
        x = (left - self.pad + m) if "left" in ICON_CORNER else (right - self.pad - F - m)
        y = (top - self.pad + m) if "top" in ICON_CORNER else (bottom - self.pad - F - m)
        return x, y

    def _overlay_position(self):
        ax = self.settings.get("coordinates_x", 700)
        ay = self.settings.get("coordinates_y", 5)
        x = ax - self.icon_w - ICON_GAP
        if x < 0:
            x = ax + TEXT_CLEARANCE + ICON_GAP
        return x, ay

    def _draw_outline(self, region):
        w = region["right"] - region["left"]
        h = region["bottom"] - region["top"]
        self.outline.geometry(f"{w}x{h}+{region['left']}+{region['top']}")
        self.outline_canvas.config(width=w, height=h)
        self.outline_canvas.delete("all")
        b = RECT_WIDTH
        self.outline_canvas.create_rectangle(b, b, w - b, h - b,
                                             outline=RECT_COLOR, width=b)

    def _show(self):
        region = self._region()

        ix, iy = self._corner_position(region) if region else self._overlay_position()
        self.window.geometry(f"+{int(ix)}+{int(iy)}")
        self.window.deiconify()
        self.window.lift()

        if SHOW_CAPTURE_RECT and region:
            self._draw_outline(region)
            self.outline.deiconify()
            self.outline.lift()
        else:
            self.outline.withdraw()

        if self._hide_id is not None:
            try:
                self.window.after_cancel(self._hide_id)
            except Exception:
                pass
        self._hide_id = self.window.after(NOTIFICATION_DURATION_MS, self._auto_hide)

    def _auto_hide(self):
        try:
            self.window.withdraw()
            self.outline.withdraw()
        except Exception:
            pass

    def notify(self):
        try:
            self.window.after(0, self._show)
        except Exception:
            pass