from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
ICON_NAMES = (
    "restart",
    "audio-on",
    "audio-off",
    "fullscreen-enter",
    "fullscreen-exit",
    "pause",
    "play",
    "stopwatch",
)
BACKGROUND_NAMES = (
    "sector-azure",
    "sector-quasar",
    "sector-nexus",
    "campaign-map",
)
TUTORIAL_GESTURE_NAMES = (
    "connect-gesture",
    "cut-gesture",
)
QUASAR_OWNERS = (
    "player",
    "enemy",
)


def resize_capture_texture() -> None:
    source = ROOT / "assets/source/vfx/capture-burst-additive.png"
    destination = ROOT / "public/assets/vfx/capture-burst.png"
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(destination, optimize=True)


def split_hud_icons() -> None:
    source = ROOT / "assets/source/ui/hud-icons-transparent.png"
    destination = ROOT / "public/assets/ui"
    with Image.open(source) as sheet:
        sheet = sheet.convert("RGBA")
        cell_width = sheet.width // 4
        cell_height = sheet.height // 2

        for index, name in enumerate(ICON_NAMES):
            column = index % 4
            row = index // 4
            cell = sheet.crop(
                (
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            bounds = cell.getchannel("A").getbbox()
            if bounds is None:
                raise RuntimeError(f"Generated icon cell is empty: {name}")

            icon = cell.crop(bounds)
            padding = max(12, round(max(icon.size) * 0.1))
            side = max(icon.size) + padding * 2
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.alpha_composite(
                icon,
                ((side - icon.width) // 2, (side - icon.height) // 2),
            )
            square.thumbnail((128, 128), Image.Resampling.LANCZOS)
            square.save(destination / f"{name}.png", optimize=True)


def resize_backgrounds() -> None:
    source_directory = ROOT / "assets/source/backgrounds"
    destination = ROOT / "public/assets/backgrounds"
    destination.mkdir(parents=True, exist_ok=True)

    for name in BACKGROUND_NAMES:
        source = source_directory / f"{name}-source.png"
        with Image.open(source) as image:
            image = image.convert("RGB")
            target_ratio = 16 / 9
            image_ratio = image.width / image.height

            if image_ratio > target_ratio:
                crop_width = round(image.height * target_ratio)
                left = (image.width - crop_width) // 2
                image = image.crop((left, 0, left + crop_width, image.height))
            else:
                crop_height = round(image.width / target_ratio)
                top = (image.height - crop_height) // 2
                image = image.crop((0, top, image.width, top + crop_height))

            image = image.resize((1600, 900), Image.Resampling.LANCZOS)
            image.save(
                destination / f"{name}.webp",
                "WEBP",
                quality=88,
                method=6,
            )


def split_tutorial_gestures() -> None:
    source = ROOT / "assets/source/tutorial/tutorial-gestures-transparent.png"
    destination = ROOT / "public/assets/tutorial"
    destination.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as sheet:
        sheet = sheet.convert("RGBA")
        cell_width = sheet.width // len(TUTORIAL_GESTURE_NAMES)

        for index, name in enumerate(TUTORIAL_GESTURE_NAMES):
            cell = sheet.crop(
                (
                    index * cell_width,
                    0,
                    (index + 1) * cell_width,
                    sheet.height,
                )
            )
            bounds = cell.getchannel("A").getbbox()
            if bounds is None:
                raise RuntimeError(f"Generated tutorial gesture is empty: {name}")

            gesture = cell.crop(bounds)
            padding = max(20, round(max(gesture.size) * 0.08))
            side = max(gesture.size) + padding * 2
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.alpha_composite(
                gesture,
                ((side - gesture.width) // 2, (side - gesture.height) // 2),
            )
            square.thumbnail((256, 256), Image.Resampling.LANCZOS)
            square.save(destination / f"{name}.png", optimize=True)


def split_quasar_systems() -> None:
    source = ROOT / "assets/source/systems/system-quasar-pair-transparent.png"
    destination = ROOT / "public/assets/systems"

    with Image.open(source) as sheet:
        sheet = sheet.convert("RGBA")
        cell_width = sheet.width // len(QUASAR_OWNERS)

        for index, owner in enumerate(QUASAR_OWNERS):
            cell = sheet.crop(
                (
                    index * cell_width,
                    0,
                    (index + 1) * cell_width,
                    sheet.height,
                )
            )
            bounds = cell.getchannel("A").getbbox()
            if bounds is None:
                raise RuntimeError(f"Generated Quasar system is empty: {owner}")

            system = cell.crop(bounds)
            padding = max(24, round(max(system.size) * 0.06))
            side = max(system.size) + padding * 2
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.alpha_composite(
                system,
                ((side - system.width) // 2, (side - system.height) // 2),
            )
            square.thumbnail((512, 512), Image.Resampling.LANCZOS)
            square.save(
                destination / f"system-{owner}-quasar.png",
                optimize=True,
            )


if __name__ == "__main__":
    resize_capture_texture()
    split_hud_icons()
    resize_backgrounds()
    split_tutorial_gestures()
    split_quasar_systems()
