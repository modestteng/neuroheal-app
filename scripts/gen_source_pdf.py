"""
生成软件著作权登记申请用的源代码 PDF。

输出：软著材料/源代码.pdf

格式要求（来自中国版权保护中心 2026 要求）：
- A4 单面
- 每页 ≥ 50 行（本脚本固定 55 行）
- 页眉左：智愈莘莘 NeuroHeal 脑电情绪监测与干预反馈系统 V1.0
- 页眉右：第 X 页 / 共 Y 页
- 不含空行
- 最后一页是程序结束页
- 等宽字体
"""
from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "软著材料" / "源代码.pdf"
OUT_FULL = ROOT / "软著材料" / "源代码-完整版.pdf"

SOFTWARE_TITLE = "智愈莘莘 NeuroHeal 脑电情绪监测与干预反馈系统 V1.0"

# 文件顺序：入口 → 闭环核心 → 数据 → 主屏 → 子屏 → 组件 → 钩子 → 样式 → 配置 → 后端
# 后端 server/deepseek.mjs 放最后，保证末页是 server.listen 真正的程序结束
ORDERED_FILES: list[str] = [
    "src/main.tsx",
    "src/App.tsx",
    "src/nav.tsx",
    "src/state/useValenceLoop.tsx",
    "src/game-session.tsx",
    "src/data/mock.ts",
    "src/screens/HomeScreen.tsx",
    "src/screens/TrainScreen.tsx",
    "src/screens/CommunityScreen.tsx",
    "src/screens/sub/DeviceScreen.tsx",
    "src/screens/sub/PrescriptionScreen.tsx",
    "src/screens/sub/PlayerScreen.tsx",
    "src/screens/sub/AiChatScreen.tsx",
    "src/screens/sub/GrowthScreen.tsx",
    "src/screens/sub/RaceScreen.tsx",
    "src/components/BottomNav.tsx",
    "src/components/PhoneFrame.tsx",
    "src/components/SubScreen.tsx",
    "src/components/ui.tsx",
    "src/hooks/useClickSound.ts",
    "src/hooks/useSpeechGuide.ts",
    "src/index.css",           # 设计系统样式（823 行）
    "vite.config.ts",          # 构建配置 + PWA manifest
    "eslint.config.js",        # 代码规范配置
    "tsconfig.json",           # TS 项目引用
    "tsconfig.app.json",       # 前端 TS 编译选项
    "tsconfig.node.json",      # 构建工具 TS 选项
    "package.json",            # 项目元数据 + 依赖清单
    "server/deepseek.mjs",     # 必须放最后，末行 server.listen 即程序结束
]

LINES_PER_PAGE = 55
MAX_CHARS_PER_LINE = 100
BODY_FONT_SIZE = 8.5
BODY_LINE_HEIGHT = 11.5
MARGIN_LEFT = 18 * mm
MARGIN_RIGHT = 12 * mm
MARGIN_TOP = 18 * mm
MARGIN_BOTTOM = 14 * mm


def register_cjk_fonts() -> tuple[str, str]:
    """注册中文字体；正文用 NSimSun（新宋体，等宽且支持中文），页眉用同字体。"""
    win_fonts_dir = Path("C:/Windows/Fonts")

    # 优先尝试 NSimSun（新宋体, 等宽中英混排）
    body_font = "Helvetica"
    simsun = win_fonts_dir / "simsun.ttc"
    if simsun.exists():
        # TTC 文件需要 subfontIndex；simsun.ttc 内 0=SimSun, 1=NSimSun
        for idx, name in [(1, "NSimSun"), (0, "SimSun")]:
            try:
                pdfmetrics.registerFont(TTFont(name, str(simsun), subfontIndex=idx))
                body_font = name
                break
            except Exception:
                continue

    # 页眉同样用宋体保证中文可见
    header_font = body_font
    return header_font, body_font


def read_source_lines() -> list[tuple[str, list[str]]]:
    """读所有源码，返回 [(相对路径, 非空行列表), ...]"""
    blocks: list[tuple[str, list[str]]] = []
    for rel in ORDERED_FILES:
        path = ROOT / rel
        if not path.exists():
            print(f"[警告] 文件不存在：{rel}")
            continue
        raw = path.read_text(encoding="utf-8").splitlines()
        # 不含空行：剥掉只有空白的行
        non_empty = [line.rstrip() for line in raw if line.strip()]
        # 太长的行做软换行（避免溢出页面）
        wrapped: list[str] = []
        for line in non_empty:
            if len(line) <= MAX_CHARS_PER_LINE:
                wrapped.append(line)
            else:
                # 按长度切片，后续片用 4 空格缩进
                first = True
                for i in range(0, len(line), MAX_CHARS_PER_LINE):
                    chunk = line[i : i + MAX_CHARS_PER_LINE]
                    wrapped.append(chunk if first else "    " + chunk)
                    first = False
        blocks.append((rel, wrapped))
    return blocks


def lay_out_lines(blocks: list[tuple[str, list[str]]]) -> list[str]:
    """把所有源码块平铺成单一行列表，每个文件前插入一行注释分隔。"""
    flat: list[str] = []
    for idx, (rel, lines) in enumerate(blocks, start=1):
        # 文件分隔行（也算 1 行内容）
        flat.append(f"/* ============ {idx:02d} 文件：{rel}  共 {len(lines)} 行 ============ */")
        flat.extend(lines)
    return flat


def draw_header(c: canvas.Canvas, cjk_font: str, page_no: int, total_pages: int, page_w: float, page_h: float) -> None:
    c.setFont(cjk_font, 8.5)
    c.drawString(MARGIN_LEFT, page_h - MARGIN_TOP + 6, SOFTWARE_TITLE)
    right_text = f"第 {page_no} 页 / 共 {total_pages} 页"
    c.drawRightString(page_w - MARGIN_RIGHT, page_h - MARGIN_TOP + 6, right_text)
    # 头线
    c.setLineWidth(0.4)
    c.line(MARGIN_LEFT, page_h - MARGIN_TOP + 2, page_w - MARGIN_RIGHT, page_h - MARGIN_TOP + 2)


def _render_pdf(out_path: Path, all_lines: list[str], total_pages: int, cjk_font: str, mono_font: str) -> None:
    """把 all_lines 按 LINES_PER_PAGE 切页写入 PDF。"""
    page_w, page_h = A4
    out_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(out_path), pagesize=A4)
    c.setTitle(SOFTWARE_TITLE)

    for page_no in range(1, total_pages + 1):
        draw_header(c, cjk_font, page_no, total_pages, page_w, page_h)
        start = (page_no - 1) * LINES_PER_PAGE
        chunk = all_lines[start : start + LINES_PER_PAGE]
        c.setFont(mono_font, BODY_FONT_SIZE)
        y = page_h - MARGIN_TOP - BODY_LINE_HEIGHT + 2
        for line in chunk:
            c.drawString(MARGIN_LEFT, y, line)
            y -= BODY_LINE_HEIGHT
        c.showPage()
    c.save()


def build_pdf() -> None:
    cjk_font, mono_font = register_cjk_fonts()
    blocks = read_source_lines()
    all_lines = lay_out_lines(blocks)
    total_lines = len(all_lines)
    total_pages = (total_lines + LINES_PER_PAGE - 1) // LINES_PER_PAGE

    print(f"[统计] 文件 {len(blocks)} 个，非空行总计 {total_lines}，整本共 {total_pages} 页")

    # 1) 先生成完整版（备查用，不上传）
    _render_pdf(OUT_FULL, all_lines, total_pages, cjk_font, mono_font)
    print(f"[完成] 完整版（备查）：{OUT_FULL.name} · {total_pages} 页")

    # 2) 上传版：≥60 页用 前30 + 后30 = 60 页；<60 页全交
    if total_pages > 60:
        front = all_lines[: 30 * LINES_PER_PAGE]
        back = all_lines[(total_pages - 30) * LINES_PER_PAGE :]
        submit_lines = front + back
        submit_pages = 60
        _render_pdf(OUT, submit_lines, submit_pages, cjk_font, mono_font)
        print(f"[完成] 上传版（前30+后30 = 60 页）：{OUT.name}")
        print(f"        前 30 页：第 1 页起 ~ 第 {30 * LINES_PER_PAGE} 行")
        print(f"        后 30 页：第 {(total_pages - 30) * LINES_PER_PAGE + 1} 行 ~ 程序末尾")
    else:
        _render_pdf(OUT, all_lines, total_pages, cjk_font, mono_font)
        print(f"[完成] 上传版（不足 60 页，全部提交）：{OUT.name} · {total_pages} 页")


if __name__ == "__main__":
    build_pdf()
