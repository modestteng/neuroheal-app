import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, PhoneCall, Send, ShieldCheck, Sparkle, Volume2, VolumeX } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { aiOpening, aiQuickAsks } from "../../data/mock";
import { useSpeechGuide } from "../../hooks/useSpeechGuide";

type Msg = { id: number; role: "ai" | "me"; text: string };
type ApiMessage = { role: "assistant" | "user"; content: string };
type ChatResponse = { reply?: string; error?: string };

const CHAT_HISTORY_LIMIT = 12;
const NETWORK_ERROR_REPLY = "我刚刚和服务端连线时遇到一点问题。你可以稍后再试一次，或者先把想说的话留在这里。";

function toApiMessages(messages: Msg[]): ApiMessage[] {
  return messages.slice(-CHAT_HISTORY_LIMIT).map((message) => ({
    role: message.role === "ai" ? "assistant" : "user",
    content: message.text,
  }));
}

export default function AiChatScreen() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: "ai", text: aiOpening }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const idRef = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const introSpokenRef = useRef(false);
  const speech = useSpeechGuide(true);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (introSpokenRef.current || !speech.enabled) return;

    introSpokenRef.current = true;
    const timer = window.setTimeout(() => {
      speech.speak(`你已进入 AI 心理陪伴界面。${aiOpening}`);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [speech, speech.enabled]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || typing) return;

    const nextMessage = { id: idRef.current++, role: "me" as const, text: content };
    const nextMsgs = [...msgs, nextMessage];

    setMsgs(nextMsgs);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(nextMsgs) }),
      });

      const data = await response.json() as ChatResponse;
      const reply = data.reply?.trim();

      if (!response.ok || !reply) {
        throw new Error(data.error || "DeepSeek response is empty.");
      }

      setMsgs((messages) => [...messages, { id: idRef.current++, role: "ai", text: reply }]);
      speech.speak(reply);
    } catch (error) {
      console.error(error);
      setMsgs((messages) => [...messages, { id: idRef.current++, role: "ai", text: NETWORK_ERROR_REPLY }]);
      speech.speak(NETWORK_ERROR_REPLY);
    } finally {
      setTyping(false);
    }
  };

  const fireToast = (message: string) => {
    setToast(message);
    speech.speak(message);
    setTimeout(() => setToast(null), 2600);
  };

  const toggleSpeech = () => {
    if (!speech.supported) {
      fireToast("当前浏览器暂不支持语音播报");
      return;
    }

    const nextEnabled = !speech.enabled;
    speech.toggle();
    fireToast(nextEnabled ? "语音陪伴已开启，小愈会读出回复" : "语音陪伴已关闭");
  };

  return (
    <SubScreen
      title="AI 心理陪伴 · 小愈"
      bodyClassName="ai-chat-body"
      headRight={
        <div className="ai-head-tools">
          <button
            className={`voice-toggle${speech.enabled ? " on" : ""}${speech.speaking ? " speaking" : ""}`}
            onClick={toggleSpeech}
            aria-label={speech.enabled ? "关闭语音陪伴" : "开启语音陪伴"}
            title={speech.enabled ? "关闭语音陪伴" : "开启语音陪伴"}
          >
            {speech.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <Sparkle size={16} color="var(--purple)" />
        </div>
      }
    >
      <div className="voice-status">
        <span className={speech.enabled ? "voice-dot on" : "voice-dot"} />
        {speech.enabled ? (speech.speaking ? "小愈正在轻声播报" : "语音陪伴已开启，AI 回复会自动朗读") : "语音陪伴已关闭，点右上角可开启"}
      </div>

      <div className="ai-actions">
        <button className="btn btn-ghost btn-sm grow" onClick={() => fireToast("已为你预约校心理中心 · 周四 15:00，老师会主动联系你")}>
          <CalendarCheck size={14} /> 预约校心理中心
        </button>
        <button
          className="btn btn-sm grow"
          style={{ background: "var(--amber-soft)", color: "var(--joy-deep)" }}
          onClick={() => fireToast("已接通 24h 心理援助热线 · 你不是一个人")}
        >
          <PhoneCall size={14} /> 24h 援助热线
        </button>
      </div>

      <div className="chat-list">
        {msgs.map((message) => (
          <motion.div
            key={message.id}
            className={`bubble-row ${message.role}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            {message.role === "ai" && <div className="ai-avatar">愈</div>}
            <div className={`bubble ${message.role}`}>{message.text}</div>
          </motion.div>
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div className="bubble-row ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ai-avatar">愈</div>
              <div className="bubble ai typing"><span /><span /><span /></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="chat-composer">
        <div className="quick-asks">
          {aiQuickAsks.map((question) => (
            <button key={question} className="chip" onClick={() => void send(question)} disabled={typing}>{question}</button>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void send(input); }}
            placeholder="想说点什么，都可以慢慢讲…"
            disabled={typing}
          />
          <button className="chat-send" onClick={() => void send(input)} aria-label="发送" disabled={typing}>
            <Send size={16} color="#fff" />
          </button>
        </div>

        <div className="row chat-note" style={{ gap: 8, padding: "2px 2px 0" }}>
          <ShieldCheck size={13} color="var(--teal-deep)" style={{ flex: "none" }} />
          <span className="tiny">小愈是 AI 倾听陪伴，不替代专业诊疗。如有危机，请使用上方“援助热线”或联系现实中的可信支持。</span>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </SubScreen>
  );
}
