import cv2
import numpy as np
import pyautogui

# Overlay quality presets. "speed" reproduces the original fast pipeline;
# "quality" renders at full resolution with better matching/encoding (slower).
QUALITY_PRESETS = {
    "speed": {
        "base_scale": 0.8,                  # output canvas scale (vs. source map)
        "sift_scale": 0.5,                  # matching scale (vs. base)
        "flann_trees": 1,
        "flann_checks": 10,
        "ratio": 0.7,                       # Lowe ratio test
        "jpeg_quality": 95,
        "downscale_interp": cv2.INTER_LINEAR,
        "warp_interp": cv2.INTER_LINEAR,
    },
    "quality": {
        "base_scale": 1.0,                  # full-resolution output
        "sift_scale": 0.7,                  # more features -> better alignment
        "flann_trees": 5,
        "flann_checks": 50,
        "ratio": 0.72,
        "jpeg_quality": 98,
        "downscale_interp": cv2.INTER_AREA,
        "warp_interp": cv2.INTER_CUBIC,
    },
}


class ImageCache:
    def __init__(self):
        self.memory_cache = {}

    def get_image(self, key):
        return self.memory_cache.get(key)

    def store_image(self, key, image):
        self.memory_cache[key] = image


image_cache = ImageCache()


def get_cached_image(map_name):
    """Full-resolution decoded minimap (used to decide whether to refetch map data)."""
    return image_cache.get_image(f"{map_name}_full")


def _get_full_minimap(image_data, map_name):
    key = f"{map_name}_full"
    cached = image_cache.get_image(key)
    if cached is not None:
        return cached
    decoded = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
    image_cache.store_image(key, decoded)
    return decoded


def _get_scaled(image, scale, cache_key, interp):
    cached = image_cache.get_image(cache_key)
    if cached is not None:
        return cached
    resized = image if scale == 1.0 else cv2.resize(
        image, None, fx=scale, fy=scale, interpolation=interp)
    image_cache.store_image(cache_key, resized)
    return resized


def overlay_images(image_data, zoomed_in_image, map_name, mode="speed"):
    preset = QUALITY_PRESETS.get(mode, QUALITY_PRESETS["speed"])
    base_scale = preset["base_scale"]
    sift_scale = preset["sift_scale"]
    interp = preset["downscale_interp"]

    full = _get_full_minimap(image_data, map_name)
    base = _get_scaled(full, base_scale, f"{map_name}_base_{mode}", interp)
    base_small = _get_scaled(base, sift_scale, f"{map_name}_sift_{mode}", interp)

    result_minimap = base.copy()

    sift = cv2.SIFT_create()
    kp1_small, des1_small = sift.detectAndCompute(base_small, None)
    kp2, des2 = sift.detectAndCompute(zoomed_in_image, None)

    if (des1_small is not None and des2 is not None
            and len(kp1_small) >= 2 and len(kp2) >= 2):
        flann = cv2.FlannBasedMatcher(
            dict(algorithm=1, trees=preset["flann_trees"]),
            dict(checks=preset["flann_checks"]),
        )
        matches = flann.knnMatch(des1_small, des2, k=2)

        good_matches = []
        for pair in matches:
            if len(pair) < 2:
                continue
            m, n = pair
            if m.distance < preset["ratio"] * n.distance:
                good_matches.append(m)

        if len(good_matches) > 10:
            src_pts_small = np.float32([kp1_small[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            src_pts = src_pts_small / sift_scale
            matrix, _ = cv2.findHomography(dst_pts, src_pts, cv2.RANSAC, 5.0)

            h, w, _ = result_minimap.shape
            warped_image = cv2.warpPerspective(
                zoomed_in_image, matrix, (w, h), flags=preset["warp_interp"])

            overlay_mask = np.max(warped_image, axis=2) > 0
            result_minimap[overlay_mask] = warped_image[overlay_mask]

    encode_params = [cv2.IMWRITE_JPEG_QUALITY, preset["jpeg_quality"]]
    _, img_encoded = cv2.imencode(".jpg", result_minimap, encode_params)
    return img_encoded.tobytes()


def capture_screenshot():
    from config import get_map_coordinates

    screenshot = pyautogui.screenshot()
    screenshot_cv = np.array(screenshot)
    screenshot_cv = cv2.cvtColor(screenshot_cv, cv2.COLOR_RGB2BGR)

    map_coords = get_map_coordinates()

    # If coordinates are not set (all zeros), fall back to resolution-based coordinates
    if all(value == 0 for value in map_coords.values()):
        screen_width, screen_height = pyautogui.size()
        game_resolution = (screen_width, screen_height)
        coordinates = {
            "2560x1440": {"mapCoordinates": [1001, 136, 2278, 1412]},
            "1920x1080": {"mapCoordinates": [751, 102, 1708, 1059]},
            "1920x1200": {"mapCoordinates": [728, 113, 1791, 1177]},
            "2560x1080": {"mapCoordinates": [1071, 102, 2028, 1059]},
            "2560x1600": {"mapCoordinates": [970, 151, 2389, 1569]},
            "2880x1620": {"mapCoordinates": [1127, 153, 2563, 1589]},
            "3439x1439": {"mapCoordinates": [1441, 136, 2718, 1412]},
            "3440x1440": {"mapCoordinates": [747, 136, 3412, 1412]},
            "3840x2160": {"mapCoordinates": [1502, 204, 3417, 2119]},
        }

        current_resolution = f"{game_resolution[0]}x{game_resolution[1]}"
        if current_resolution in coordinates:
            map_coordinates = coordinates[current_resolution]["mapCoordinates"]
            return screenshot_cv[
                map_coordinates[1]:map_coordinates[3],
                map_coordinates[0]:map_coordinates[2]
            ]
        else:
            raise ValueError(f"Unsupported resolution: {current_resolution}")

    return screenshot_cv[
        map_coords["top"]:map_coords["bottom"],
        map_coords["left"]:map_coords["right"]
    ]