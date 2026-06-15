"""
用 Playwright 自动跑前端、按图序截 9 张界面截图。

输出：软著材料/screenshots/*.png

约定：
- viewport 1366×900 大屏，phone-frame 居中
- 每张图只截 .phone 选择器内容（378×818），保证去掉 PC 侧栏装饰
- 等待 Reveal stagger 动画完成（~1500ms）再截
"""
from __future__ import annotations

import time
from pathlib import Path

from playwright.sync_api import sync_playwright, Page

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "软著材料" / "screenshots"
URL = "http://localhost:5173"

VIEWPORT = {"width": 1366, "height": 900}
PHONE_SELECTOR = ".phone"
ANIM_SETTLE_MS = 1500  # 等 Reveal stagger 动画完成


def shoot(page: Page, name: str, wait_ms: int = ANIM_SETTLE_MS) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    page.wait_for_timeout(wait_ms)
    out_path = OUT_DIR / f"{name}.png"
    page.locator(PHONE_SELECTOR).first.screenshot(path=str(out_path))
    print(f"  [OK] {out_path.name}")


def click_tab(page: Page, label: str) -> None:
    """通过 nav-label 文字点击底栏 Tab。"""
    page.locator(f".nav-tab:has(.nav-label:has-text('{label}'))").click()


def open_then_close_sub(page: Page, opener, screenshot_name: str) -> None:
    """通用：执行 opener 打开子页 → 截图 → 点返回关闭。"""
    opener()
    page.wait_for_selector(".phone-overlay", state="visible")
    shoot(page, screenshot_name)
    # 点返回（SubScreen 的 .sub-back）
    page.locator(".sub-back").first.click()
    page.wait_for_timeout(500)


def main() -> None:
    print(f"输出目录：{OUT_DIR}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, device_scale_factor=2)
        page = context.new_page()
        page.goto(URL, wait_until="networkidle")
        page.wait_for_selector(".phone", state="visible")

        # 1. 首页（监测主屏）
        print("[1/9] home_main.png")
        shoot(page, "01_home_main")

        # 2. 设备子页（从首页点设备 chip）
        print("[2/9] sub_device.png")
        open_then_close_sub(
            page,
            lambda: page.locator(".monitor-eeg-panel .chip[aria-label='打开设备与校准']").click(),
            "02_sub_device",
        )

        # 3. 干预主屏
        print("[3/9] train_main.png")
        click_tab(page, "干预")
        shoot(page, "03_train_main")

        # 4. AI 陪伴子页（从干预页点 AI 陪伴卡）
        print("[4/9] sub_aichat.png")
        open_then_close_sub(
            page,
            lambda: page.locator(".intervention-action-card:has-text('AI 陪伴')").click(),
            "04_sub_aichat",
        )

        # 5. 呼吸训练子页（点呼吸训练卡）
        print("[5/9] sub_player.png")
        open_then_close_sub(
            page,
            lambda: page.locator(".intervention-action-card:has-text('呼吸')").first.click(),
            "05_sub_player",
        )

        # 6. 意念赛车子页（点调节游戏卡）
        print("[6/9] sub_race.png")
        open_then_close_sub(
            page,
            lambda: page.locator(".intervention-action-card:has-text('意念赛车')").click(),
            "06_sub_race",
        )

        # 7. 数字处方子页（点第一个数字处方卡）
        print("[7/9] sub_prescription.png")
        open_then_close_sub(
            page,
            lambda: page.locator("button.card.tint-blue:has-text('考研冲刺专注流')").click(),
            "07_sub_prescription",
        )

        # 8. 记录主屏
        print("[8/9] community_main.png")
        click_tab(page, "记录")
        shoot(page, "08_community_main")

        # 9. 成长档案子页（从记录页点 成长档案 按钮）
        print("[9/9] sub_growth.png")
        open_then_close_sub(
            page,
            lambda: page.locator("button.btn-primary:has-text('打开成长档案')").click(),
            "09_sub_growth",
        )

        context.close()
        browser.close()
    print(f"\n[完成] 共 9 张截图已输出到：{OUT_DIR}")


if __name__ == "__main__":
    main()
