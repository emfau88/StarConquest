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
PROGRESSION_ICON_NAMES = (
    "locked",
    "completed",
    "star",
)
HELION_SYSTEM_TIERS = (
    "small",
    "medium",
    "large",
)
CORE_SYSTEM_OWNERS = (
    "player",
    "enemy",
    "neutral",
)
CORE_SYSTEM_TIERS = (
    "small",
    "medium",
    "large",
)
FLEET_SHIP_ROLES = (
    "interceptor",
    "cruiser",
)
FLEET_SHIP_OWNERS = (
    "player",
    "enemy",
    "enemy2",
)


def save_runtime_webp(
    image: Image.Image,
    destination: Path,
    maximum_size: tuple[int, int],
    quality: int = 88,
) -> None:
    image = image.convert("RGBA")
    image.thumbnail(maximum_size, Image.Resampling.LANCZOS)
    image.save(
        destination,
        "WEBP",
        quality=quality,
        method=6,
    )


def remove_magenta_fringe(image: Image.Image) -> Image.Image:
    pixels = []
    for red, green, blue, alpha in image.convert("RGBA").getdata():
        is_magenta = (
            alpha > 0
            and red - green > 24
            and blue - green > 24
        )
        pixels.append(
            (red, green, blue, 0)
            if is_magenta
            else (red, green, blue, alpha)
        )
    cleaned = Image.new("RGBA", image.size)
    cleaned.putdata(pixels)
    return cleaned


def alpha_column_runs(image: Image.Image) -> list[tuple[int, int]]:
    alpha = image.getchannel("A")
    active_columns = [
        alpha.crop((x, 0, x + 1, image.height)).getbbox() is not None
        for x in range(image.width)
    ]
    runs: list[tuple[int, int]] = []
    start: int | None = None
    for x, active in enumerate((*active_columns, False)):
        if active and start is None:
            start = x
        elif not active and start is not None:
            if x - start > 8:
                runs.append((start, x))
            start = None
    return runs


def resize_capture_texture() -> None:
    source = ROOT / "assets/source/vfx/capture-burst-additive.png"
    destination = ROOT / "public/assets/vfx/capture-burst.webp"
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=86, method=6)


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
            save_runtime_webp(
                square,
                destination / f"system-{owner}-quasar.webp",
                (512, 512),
            )


def optimize_core_systems() -> None:
    source_directory = ROOT / "assets/source/runtime-originals/systems"
    destination = ROOT / "public/assets/systems"

    for owner in CORE_SYSTEM_OWNERS:
        for tier in CORE_SYSTEM_TIERS:
            filename = f"system-{owner}-{tier}.png"
            with Image.open(source_directory / filename) as image:
                save_runtime_webp(
                    image,
                    destination / f"system-{owner}-{tier}.webp",
                    (640, 640),
                )


def split_progression_icons() -> None:
    source = (
        ROOT
        / "assets/source/progression/campaign-status-icons-transparent.png"
    )
    destination = ROOT / "public/assets/progression"
    destination.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as sheet:
        sheet = sheet.convert("RGBA")
        cell_width = sheet.width // len(PROGRESSION_ICON_NAMES)

        for index, name in enumerate(PROGRESSION_ICON_NAMES):
            cell = sheet.crop(
                (
                    index * cell_width,
                    0,
                    (index + 1) * cell_width,
                    sheet.height,
                )
            )
            cell = remove_magenta_fringe(cell)
            bounds = cell.getchannel("A").getbbox()
            if bounds is None:
                raise RuntimeError(f"Generated progression icon is empty: {name}")

            icon = cell.crop(bounds)
            padding = max(14, round(max(icon.size) * 0.08))
            side = max(icon.size) + padding * 2
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.alpha_composite(
                icon,
                ((side - icon.width) // 2, (side - icon.height) // 2),
            )
            square.thumbnail((128, 128), Image.Resampling.LANCZOS)
            square.save(destination / f"{name}.png", optimize=True)


def split_helion_assets() -> None:
    source_directory = ROOT / "assets/source/factions/helion"
    system_destination = ROOT / "public/assets/systems"
    ship_destination = ROOT / "public/assets/ships"

    with Image.open(
        source_directory / "helion-systems-transparent.png"
    ) as sheet:
        sheet = sheet.convert("RGBA")
        column_runs = alpha_column_runs(sheet)
        if len(column_runs) != len(HELION_SYSTEM_TIERS):
            raise RuntimeError(
                "Generated Helion sheet does not contain three separated systems"
            )

        for tier, (left, right) in zip(
            HELION_SYSTEM_TIERS,
            column_runs,
            strict=True,
        ):
            cell = sheet.crop((left, 0, right, sheet.height))
            bounds = cell.getchannel("A").getbbox()
            if bounds is None:
                raise RuntimeError(f"Generated Helion system is empty: {tier}")

            system = cell.crop(bounds)
            padding = max(24, round(max(system.size) * 0.06))
            side = max(system.size) + padding * 2
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.alpha_composite(
                system,
                ((side - system.width) // 2, (side - system.height) // 2),
            )
            save_runtime_webp(
                square,
                system_destination / f"system-enemy2-{tier}.webp",
                (512, 512),
            )

    with Image.open(
        source_directory / "transport-helion-transparent.png"
    ) as ship:
        save_runtime_webp(
            ship,
            ship_destination / "transport-enemy2.webp",
            (256, 256),
        )


def optimize_core_transport_ships() -> None:
    source_directory = ROOT / "assets/source/runtime-originals/ships"
    destination = ROOT / "public/assets/ships"

    for owner in ("player", "enemy"):
        with Image.open(source_directory / f"transport-{owner}.png") as ship:
            save_runtime_webp(
                ship,
                destination / f"transport-{owner}.webp",
                (256, 256),
            )


def optimize_generated_fleet_ships() -> None:
    source_directory = ROOT / "assets/source/ships"
    destination = ROOT / "public/assets/ships"

    for owner in FLEET_SHIP_OWNERS:
        for role in FLEET_SHIP_ROLES:
            source = source_directory / f"{role}-{owner}-transparent.png"
            with Image.open(source) as ship:
                save_runtime_webp(
                    ship,
                    destination / f"{role}-{owner}.webp",
                    (256, 256),
                )


if __name__ == "__main__":
    resize_capture_texture()
    split_hud_icons()
    resize_backgrounds()
    split_tutorial_gestures()
    optimize_core_systems()
    split_quasar_systems()
    split_progression_icons()
    optimize_core_transport_ships()
    optimize_generated_fleet_ships()
    split_helion_assets()
