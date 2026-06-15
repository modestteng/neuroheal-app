"""
生成 2 张架构示意图（HTML 模板 → Playwright 渲染 → PNG）：
  - 软著材料/screenshots/10_arch_diagram.png   ← 图 3.1.1 系统总体架构
  - 软著材料/screenshots/11_loop_diagram.png   ← 图 3.2.1 Valence 闭环时序

样式偏正式、淡蓝青绿配色，与项目设计系统保持一致。
"""
from __future__ import annotations

from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "软著材料" / "screenshots"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE_CSS = """
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif;
    color: #16323f;
    background: #fff;
    padding: 24px;
  }
  .diagram { width: 880px; }
  .diagram.wide { width: 1220px; }
  /* === arch === */
  .layer {
    border: 2px solid #4fb6e6;
    border-radius: 16px;
    padding: 18px 22px;
    background: linear-gradient(145deg, #f4fbfe, #ecf6fb);
    box-shadow: 0 6px 14px -8px rgba(40,120,160,.25);
  }
  .layer + .layer { margin-top: 6px; }
  .layer.proxy { border-color: #2fc6ad; background: linear-gradient(145deg, #f1fbf8, #e6f6f1); }
  .layer.external { border-color: #7c6cf0; background: linear-gradient(145deg, #f3f1fc, #ece9fa); }
  .layer-title {
    font-size: 17px; font-weight: 700; color: #237fb5;
    display: flex; align-items: center; gap: 8px;
  }
  .layer.proxy .layer-title { color: #1e9583; }
  .layer.external .layer-title { color: #564ac0; }
  .layer-tag {
    font-size: 11px; font-weight: 600;
    padding: 3px 9px; border-radius: 999px;
    background: rgba(79,182,230,.15); color: #237fb5;
  }
  .layer.proxy .layer-tag { background: rgba(47,198,173,.15); color: #1e9583; }
  .layer.external .layer-tag { background: rgba(124,108,240,.15); color: #564ac0; }
  .layer-desc {
    font-size: 13.5px; line-height: 1.7; color: #16323f;
    margin-top: 10px;
  }
  .modules {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px;
  }
  .modules > div {
    padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,.75);
    font-size: 12.5px; color: #16323f; font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(79,182,230,.18);
  }
  .arrow {
    display: flex; flex-direction: column; align-items: center;
    margin: 6px 0;
  }
  .arrow-text {
    font-size: 11.5px; color: #5e7b8a; font-weight: 600;
    padding: 4px 10px; border-radius: 999px;
    background: #fff; border: 1px dashed #b5cdd9;
    margin-bottom: 2px;
  }
  .arrow-bar { font-size: 22px; color: #5e7b8a; line-height: 1; }

  /* === loop === */
  .loop-row {
    display: flex; align-items: stretch; justify-content: space-between;
    gap: 8px;
  }
  .node {
    flex: 1; min-width: 0;
    padding: 14px 12px;
    border-radius: 14px;
    background: linear-gradient(145deg, #ffffff, #f4fbfd);
    border: 2px solid #4fb6e6;
    box-shadow: 0 6px 14px -8px rgba(40,120,160,.22);
    display: flex; flex-direction: column; gap: 6px;
  }
  .node.calm { border-color: #2fc6ad; background: linear-gradient(145deg, #ffffff, #f0fbf6); }
  .node.feedback { border-color: #7c6cf0; background: linear-gradient(145deg, #ffffff, #f3f1fc); }
  .node.action { border-color: #e89a4a; background: linear-gradient(145deg, #ffffff, #fdf6ec); }
  .node.success { border-color: #2fc6ad; background: linear-gradient(145deg, #ffffff, #ecfaf5); }
  .node-title { font-size: 14px; font-weight: 700; color: #16323f; line-height: 1.35; }
  .node-desc { font-size: 11px; color: #5e7b8a; line-height: 1.55; }
  .arr-h {
    flex: 0 0 30px;
    display: flex; align-items: center; justify-content: center;
    color: #5e7b8a; font-size: 22px; font-weight: 700;
  }
  .loop-return-wrap {
    margin-top: 22px;
    display: flex; align-items: center; justify-content: center;
  }
  .loop-return {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 13px; color: #1e9583; font-weight: 700;
    padding: 11px 22px; border-radius: 999px;
    background: rgba(47,198,173,.10);
    border: 1.5px dashed rgba(47,198,173,.55);
  }
  .loop-return-line {
    position: relative;
    height: 32px;
    margin: 4px 60px 0;
    border-left: 1.5px dashed rgba(47,198,173,.55);
    border-bottom: 1.5px dashed rgba(47,198,173,.55);
    border-right: 1.5px dashed rgba(47,198,173,.55);
    border-radius: 0 0 12px 12px;
  }
  .loop-return-line::before {
    content: "↑"; position: absolute; left: -10px; top: -2px;
    color: #1e9583; font-size: 18px; font-weight: 700;
  }
  .loop-return-line::after {
    content: "↑"; position: absolute; right: -10px; top: -2px;
    color: #1e9583; font-size: 18px; font-weight: 700;
  }
</style>
"""

ARCH_HTML = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">{BASE_CSS}</head><body>
<div class="diagram">

  <div class="layer">
    <div class="layer-title">
      用户交互层（Client Layer）
      <span class="layer-tag">前端 PWA · 浏览器</span>
    </div>
    <div class="layer-desc">基于 React 19 + TypeScript + Vite 8 构建的手机框形态单页应用，封装为渐进式 Web 应用（PWA），支持安装到桌面与离线运行。</div>
    <div class="modules">
      <div>监测主屏 HomeScreen</div>
      <div>干预主屏 TrainScreen</div>
      <div>记录主屏 CommunityScreen</div>
      <div>6 个子页面 (device / aichat / player / race / prescription / growth)</div>
      <div>useValenceLoop Provider</div>
      <div>共享 UI 组件库 (ui.tsx)</div>
    </div>
  </div>

  <div class="arrow">
    <div class="arrow-text">同源 HTTP · /api/*</div>
    <div class="arrow-bar">⇅</div>
  </div>

  <div class="layer proxy">
    <div class="layer-title">
      AI 反馈代理层（Proxy Layer）
      <span class="layer-tag">Node.js HTTP · 端口 8787</span>
    </div>
    <div class="layer-desc">轻量 Node.js HTTP 服务（server/deepseek.mjs），仅承载 DeepSeek API Key、做参数整形与安全校验，不持久化任何业务数据。</div>
    <div class="modules">
      <div>POST /api/chat — AI 反馈转发</div>
      <div>GET /api/health — 健康检查</div>
      <div>SYSTEM_PROMPT 闭环规则注入</div>
      <div>messages 长度上限 (12 条)</div>
      <div>API Key ASCII 合法性校验</div>
      <div>静态资源托管 (dist/*)</div>
    </div>
  </div>

  <div class="arrow">
    <div class="arrow-text">HTTPS · POST /chat/completions</div>
    <div class="arrow-bar">⇅</div>
  </div>

  <div class="layer external">
    <div class="layer-title">
      外部 AI 服务层（External AI）
      <span class="layer-tag">DeepSeek 官方 API</span>
    </div>
    <div class="layer-desc">DeepSeek 大语言模型，接收合并后的 system + user messages，根据 Valence 上下文生成温和的反馈语与下一步建议。</div>
    <div class="modules">
      <div>模型：deepseek-v4-flash</div>
      <div>温度：0.7 · 最大 tokens：600</div>
      <div>非流式响应 (stream: false)</div>
    </div>
  </div>

</div></body></html>
"""

LOOP_HTML = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">{BASE_CSS}</head><body>
<div class="diagram wide">
  <div class="loop-row">

    <div class="node">
      <div class="node-title">① EEG 信号采集</div>
      <div class="node-desc">脑电头环以 256 Hz 采样率持续输出 Fp1 / Fp2 / TP9 / TP10 四导联信号；演示版以 mock 数据驱动。</div>
    </div>
    <div class="arr-h">➜</div>
    <div class="node calm">
      <div class="node-title">② Valence 识别</div>
      <div class="node-desc">基于脑波节律推断当前 Valence 等级（高 / 较高 / 较低 / 低四级）与置信度，形成 ValenceSnapshot。</div>
    </div>
    <div class="arr-h">➜</div>
    <div class="node feedback">
      <div class="node-title">③ AI 反馈生成</div>
      <div class="node-desc">前端将 Valence 上下文注入 messages 调用 /api/chat，DeepSeek 返回 2–3 句温和安抚语 + 下一步建议。</div>
    </div>
    <div class="arr-h">➜</div>
    <div class="node action">
      <div class="node-title">④ 用户执行干预</div>
      <div class="node-desc">点击推荐入口：呼吸训练 / 数字处方 / 意念赛车 / AI 心理陪伴；完成后系统继续监测。</div>
    </div>
    <div class="arr-h">➜</div>
    <div class="node success">
      <div class="node-title">⑤ 再监测</div>
      <div class="node-desc">系统继续推进采集，写入 ClosedLoopRecord（beforeScore / afterScore / Δ），返回主线进入下一轮。</div>
    </div>

  </div>

  <div class="loop-return-line"></div>

  <div class="loop-return-wrap">
    <div class="loop-return">↺ 闭环回流：完成干预后系统继续监测 EEG 信号，进入下一轮 Valence 判定</div>
  </div>
</div></body></html>
"""


def render(html: str, out_path: Path, viewport_w: int = 940, viewport_h: int = 700) -> None:
    tmp = OUT_DIR.parent / f"_diagram_{out_path.stem}.html"
    tmp.write_text(html, encoding="utf-8")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(viewport={"width": viewport_w, "height": viewport_h}, device_scale_factor=2).new_page()
        page.goto(tmp.as_uri())
        page.wait_for_timeout(400)
        # 截 .diagram 区域，保持紧凑
        page.locator(".diagram").screenshot(path=str(out_path))
        browser.close()
    tmp.unlink(missing_ok=True)
    print(f"  [OK] {out_path.name}")


def main() -> None:
    print("生成架构示意图：")
    render(ARCH_HTML, OUT_DIR / "10_arch_diagram.png", viewport_w=940, viewport_h=820)
    # 闭环图横向展开，需更宽视口
    render(LOOP_HTML, OUT_DIR / "11_loop_diagram.png", viewport_w=1280, viewport_h=520)
    print(f"[完成] 输出目录：{OUT_DIR}")


if __name__ == "__main__":
    main()
