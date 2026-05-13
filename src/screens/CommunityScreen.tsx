import { useMemo, useState } from "react";
import {
  Bell,
  Bot,
  CalendarCheck2,
  ChevronRight,
  Crown,
  Gift,
  Heart,
  HeartHandshake,
  MessageCircleHeart,
  ShoppingBag,
  Sparkles,
  SquarePen,
} from "lucide-react";
import PurchaseCelebration from "../components/PurchaseCelebration";
import { Chip, Reveal, Track, useCountUp } from "../components/ui";
import { myRank, shopItems, treeholePosts, user } from "../data/mock";
import { buildLeaderboard } from "../lib/leaderboard";
import { useNav } from "../nav";
import { useShopSession } from "../shop-session";

export default function CommunityScreen() {
  const { openSub } = useNav();
  const { availablePoints, redeemableCount, redeemedIds, redeem } = useShopSession();
  const pointsN = useCountUp(availablePoints, 780, [availablePoints]);
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState(treeholePosts);
  const [composerHint, setComposerHint] = useState<string | null>(null);
  const trimmedDraft = draft.trim();
  const ranking = useMemo(() => buildLeaderboard(), []);
  const previewRanking = ranking.slice(0, 3);
  const currentUserRank = ranking.find((entry) => entry.id === myRank.id);

  const draftTag = useMemo(() => {
    if (/考试|考研|复习/.test(trimmedDraft)) return "#学习压力";
    if (/睡不着|失眠|熬夜/.test(trimmedDraft)) return "#睡眠";
    if (/室友|朋友|同学|关系/.test(trimmedDraft)) return "#人际关系";
    return "#此刻心情";
  }, [trimmedDraft]);

  const publishPost = () => {
    if (!trimmedDraft) {
      setComposerHint("先写下一点内容，再发布到匿名树洞。");
      return;
    }

    const newPost = {
      id: `live-${Date.now()}`,
      avatar: "心",
      tone: "var(--blue-soft)",
      nick: "匿名 · 此刻的你",
      meta: "刚刚 · 匿名树洞",
      text: trimmedDraft,
      tags: [draftTag],
      react: { heart: 0, hug: 0, reply: 0 },
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setDraft("");
    setComposerHint("已匿名发布到树洞。");
  };

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="row between">
          <div className="col" style={{ gap: 3 }}>
            <span className="kicker">树洞 · 排行榜 · 心灵积分</span>
            <span className="h1">菇愈社区</span>
          </div>
          <button
            className="avatar notice-trigger"
            style={{ width: 38, height: 38, background: "#fff", boxShadow: "var(--shadow-soft)" }}
            aria-label="通知"
            onClick={() => openSub("notifications")}
          >
            <Bell size={17} color="var(--brand-deep)" />
            <span>3</span>
          </button>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero g-purple">
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="col">
              <span className="kicker" style={{ color: "rgba(255,255,255,.78)" }}>我的心灵积分</span>
              <span className="metric num" style={{ color: "#fff" }}>{pointsN.toLocaleString()} <span style={{ fontSize: 22 }}>+</span></span>
            </div>
            <Chip variant="glass"><Crown size={12} /> Lv.{user.level} · {user.levelName}</Chip>
          </div>
          <div className="row between">
            <span className="muted on-90" style={{ fontWeight: 600 }}>本周 +{user.weekGained}</span>
            <button className="tiny" style={{ color: "#fff", display: "flex", alignItems: "center", gap: 2, fontWeight: 700 }} onClick={() => openSub("growth")}>
              成长档案 <ChevronRight size={13} />
            </button>
          </div>
          <Track pct={78} color="#fff" onGlass />
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-white grow" onClick={() => openSub("shop-catalog")}><ShoppingBag size={15} /> 兑换好礼</button>
            <button className="btn btn-outline-white grow" onClick={() => openSub("growth")}><CalendarCheck2 size={15} /> 打卡 · 勋章</button>
          </div>
        </div>
      </Reveal>

      <Reveal i={2}>
        <button className="card tint-purple" style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "100%", textAlign: "left" }} onClick={() => openSub("aichat")}>
          <div className="icon-badge shadow" style={{ background: "#fff", width: 44, height: 44 }}><Bot size={20} color="var(--purple-deep)" /></div>
          <div className="col grow" style={{ gap: 2 }}>
            <span className="body" style={{ fontWeight: 700 }}>AI 心理陪伴“小愈” · 24h 在线</span>
            <span className="tiny" style={{ color: "var(--t-secondary)" }}>有心事随时说，也能一键预约校心理中心</span>
          </div>
          <span className="chip purple live">在线</span>
          <ChevronRight size={16} color="var(--purple-deep)" />
        </button>
      </Reveal>

      <Reveal i={3}>
        <div className="card soft treehole-composer" style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}>
          <div className="avatar" style={{ width: 36, height: 36, fontSize: 16 }}><SquarePen size={16} color="var(--brand-deep)" /></div>
          <div className="treehole-compose-main">
            <input
              className="treehole-input"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (composerHint) setComposerHint(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") publishPost();
              }}
              placeholder="写下此刻的心情，匿名分享..."
              aria-label="匿名树洞内容"
            />
            {composerHint && <span className="treehole-hint">{composerHint}</span>}
          </div>
          <button className="treehole-publish" onClick={publishPost} disabled={!trimmedDraft}>发布</button>
        </div>
      </Reveal>

      <Reveal i={4}>
        <div className="section-head">
          <span className="title">匿名树洞</span>
          <span className="link">进入树洞 <ChevronRight size={13} /></span>
        </div>
      </Reveal>

      {posts.map((post, index) => (
        <Reveal i={5 + index} key={post.id}>
          <div className="card">
            <div className="row" style={{ gap: 10 }}>
              <div className="avatar" style={{ width: 34, height: 34, background: post.tone, fontSize: 16 }}>{post.avatar}</div>
              <div className="col grow" style={{ gap: 1 }}>
                <span className="muted" style={{ fontWeight: 600, color: "var(--t-primary)", fontSize: 12.5 }}>{post.nick}</span>
                <span className="tiny">{post.meta}</span>
              </div>
              <span className="tiny" style={{ letterSpacing: 1 }}>···</span>
            </div>
            <span className="body">{post.text}</span>
            <div className="pill-row">{post.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>
            <div className="row" style={{ gap: 18 }}>
              <span className="row" style={{ gap: 5 }}><Heart size={14} color="var(--stress)" /><span className="tiny" style={{ color: "var(--t-secondary)" }}>共鸣 {post.react.heart}</span></span>
              <span className="row" style={{ gap: 5 }}><HeartHandshake size={14} color="var(--brand)" /><span className="tiny" style={{ color: "var(--t-secondary)" }}>抱抱 {post.react.hug}</span></span>
              <span className="row" style={{ gap: 5 }}><MessageCircleHeart size={14} color="var(--teal-deep)" /><span className="tiny" style={{ color: "var(--t-secondary)" }}>回复 {post.react.reply}</span></span>
            </div>
          </div>
        </Reveal>
      ))}

      <Reveal i={8}>
        <div className="card">
          <div className="section-head">
            <span className="title">校园专注力排行榜 · 本周</span>
            <button className="link" onClick={() => openSub("leaderboard")}>完整榜单 <ChevronRight size={13} /></button>
          </div>
          {previewRanking.map((row) => (
            <button className="list-row leaderboard-preview-row" key={row.id} onClick={() => openSub("leaderboard")}>
              <div className="avatar num" style={{ width: 30, height: 30, background: "#f4f8fb", fontSize: 13, fontWeight: 700 }}>{row.rank}</div>
              <div className="col grow" style={{ gap: 1 }}>
                <span className="body" style={{ fontWeight: 600, fontSize: 13.5 }}>{row.faculty} · {row.alias}</span>
                <span className="tiny leaderboard-preview-score">专注力 {row.score.toLocaleString()} <em>{row.delta >= 0 ? "+" : ""}{row.delta}</em></span>
              </div>
              <ChevronRight size={16} color="var(--t-tertiary)" />
            </button>
          ))}
          <button className="row leaderboard-self" onClick={() => openSub("leaderboard")}>
            <div className="avatar num" style={{ width: 30, height: 30, background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 600 }}>{currentUserRank?.rank ?? "-"}</div>
            <div className="col grow" style={{ gap: 1 }}>
              <span className="body" style={{ fontWeight: 600, color: "var(--brand-deep)", fontSize: 13.5 }}>{myRank.name}</span>
              <span className="tiny" style={{ color: "var(--brand-deep)", opacity: 0.7 }}>{myRank.faculty}</span>
            </div>
            <span className="title num" style={{ color: "var(--brand-deep)", fontSize: 14 }}>{currentUserRank?.score.toLocaleString() ?? "--"} +</span>
          </button>
        </div>
      </Reveal>

      <Reveal i={9}>
        <div className="card shop-card">
          <div className="section-head">
            <span className="title">心灵积分商城</span>
            <button className="link" onClick={() => openSub("shop-catalog")}>全部好礼 <ChevronRight size={13} /></button>
          </div>
          <div className="shop-wallet">
            <div className="col">
              <span className="tiny">当前可用积分</span>
              <strong className="num">{availablePoints.toLocaleString()}</strong>
            </div>
            <div className="shop-wallet-divider" />
            <div className="col">
              <span className="tiny">还能兑换</span>
              <strong>{redeemableCount} 件</strong>
            </div>
            <button className="shop-wallet-badge" onClick={() => openSub("wishlist")}>
              <Gift size={15} />
              心愿仓
            </button>
          </div>

          {shopItems.map((item) => {
            const redeemed = redeemedIds.includes(item.id);
            const lackingPoints = item.cost > availablePoints;
            return (
              <div className={`list-row shop-row${redeemed ? " redeemed" : ""}`} key={item.id}>
                <div className={`icon-badge ${item.tone}`} style={{ width: 44, height: 44, fontSize: 20 }}>{item.emoji}</div>
                <div className="col grow" style={{ gap: 2 }}>
                  <span className="body" style={{ fontWeight: 600 }}>{item.name}</span>
                  <span className="tiny">{redeemed ? "已兑换 · 奖励已收入账户" : item.left}</span>
                </div>
                <div className="col" style={{ alignItems: "flex-end", gap: 5 }}>
                  <span className="row" style={{ gap: 3 }}><Sparkles size={12} color="var(--joy-deep)" /><span className="tiny num" style={{ color: "var(--joy-deep)", fontWeight: 600 }}>{item.cost}</span></span>
                  <button className={`btn btn-sm ${redeemed ? "shop-btn-done" : "btn-primary"}`} disabled={redeemed || lackingPoints} onClick={() => redeem(item)}>
                    {redeemed ? "已兑" : lackingPoints ? "差一点" : "兑换"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      <PurchaseCelebration />
    </div>
  );
}
