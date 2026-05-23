"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import {
  chat,
  PROVIDERS,
  SCRIPT_TEMPLATES,
  type ChatMessage,
  type Provider,
} from "@/lib/ai-clients";

type Config = {
  provider: Provider;
  apiKey: Record<Provider, string>;
  model: Record<Provider, string>;
  shopName: string;
  products: string;
  scriptId: string;
  customSystem: string;
};

const STORE_KEY = "biznoco_chatbot_v1";

const defaultConfig: Config = {
  provider: "gemini",
  apiKey: { anthropic: "", openai: "", gemini: "" },
  model: {
    anthropic: PROVIDERS.anthropic.defaultModel,
    openai: PROVIDERS.openai.defaultModel,
    gemini: PROVIDERS.gemini.defaultModel,
  },
  shopName: "Shop ABC",
  products: `- Áo thun cotton 100%, size S/M/L/XL, 7 màu — 189.000đ/cái, mua 3 tặng 1.
- Quần jeans nam slim-fit, size 28-34 — 359.000đ/cái.
- Free ship đơn từ 500.000đ, đổi trả trong 7 ngày.`,
  scriptId: SCRIPT_TEMPLATES[0].id,
  customSystem: "",
};

export default function ChatbotPage() {
  const [cfg, setCfg] = useState<Config>(defaultConfig);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadJSON<Partial<Config>>(STORE_KEY, {});
    setCfg((c) => ({
      ...c,
      ...saved,
      apiKey: { ...c.apiKey, ...(saved.apiKey || {}) },
      model: { ...c.model, ...(saved.model || {}) },
    }));
  }, []);

  useEffect(() => {
    saveJSON(STORE_KEY, cfg);
  }, [cfg]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const systemPrompt = useMemo(() => {
    if (cfg.customSystem.trim()) return cfg.customSystem;
    const tpl = SCRIPT_TEMPLATES.find((t) => t.id === cfg.scriptId) ?? SCRIPT_TEMPLATES[0];
    return tpl.body
      .replaceAll("{SHOP_NAME}", cfg.shopName || "shop")
      .replaceAll("{PRODUCTS}", cfg.products || "(chưa cập nhật danh sách sản phẩm)");
  }, [cfg.scriptId, cfg.shopName, cfg.products, cfg.customSystem]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await chat({
        provider: cfg.provider,
        apiKey: cfg.apiKey[cfg.provider],
        model: cfg.model[cfg.provider],
        systemPrompt,
        messages: next,
      });
      setMessages((m) => [...m, { role: "assistant", content: res.text || "(không có nội dung)" }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const currentProvider = PROVIDERS[cfg.provider];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">AI Sales Chatbot</h1>
          <p className="page-sub">
            Chatbot AI tư vấn sản phẩm & chốt sale — kết nối API OpenAI, Anthropic Claude
            hoặc Google Gemini. Key lưu local trong trình duyệt, không gửi lên server Biznoco.
          </p>
        </div>
        <div className="row">
          <span className={`tag ${cfg.apiKey[cfg.provider] ? "tag-ok" : "tag-bad"}`}>
            ● {cfg.apiKey[cfg.provider] ? `Đã có key ${currentProvider.label}` : "Chưa có API key"}
          </span>
        </div>
      </div>

      <div className="chat-shell">
        {/* Settings pane */}
        <div className="chat-pane" style={{ overflow: "auto", padding: 18 }}>
          <div className="label">Nhà cung cấp AI</div>
          <select
            value={cfg.provider}
            onChange={(e) => setCfg((c) => ({ ...c, provider: e.target.value as Provider }))}
          >
            {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDERS[p].label}
              </option>
            ))}
          </select>
          <div className="help">{currentProvider.help}</div>

          <div className="label" style={{ marginTop: 14 }}>
            API Key
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showKey ? "text" : "password"}
              placeholder={`${currentProvider.label} key...`}
              value={cfg.apiKey[cfg.provider]}
              onChange={(e) =>
                setCfg((c) => ({
                  ...c,
                  apiKey: { ...c.apiKey, [c.provider]: e.target.value },
                }))
              }
              style={{ paddingRight: 60 }}
            />
            <button
              className="btn btn-sm btn-ghost"
              style={{ position: "absolute", right: 4, top: 4, padding: "4px 8px" }}
              onClick={() => setShowKey((v) => !v)}
              type="button"
            >
              {showKey ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="label" style={{ marginTop: 14 }}>
            Model
          </div>
          <select
            value={cfg.model[cfg.provider]}
            onChange={(e) =>
              setCfg((c) => ({
                ...c,
                model: { ...c.model, [c.provider]: e.target.value },
              }))
            }
          >
            {currentProvider.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="divider" />

          <div className="label">Tên shop</div>
          <input
            value={cfg.shopName}
            onChange={(e) => setCfg((c) => ({ ...c, shopName: e.target.value }))}
          />

          <div className="label" style={{ marginTop: 14 }}>
            Kịch bản
          </div>
          <select
            value={cfg.scriptId}
            onChange={(e) => setCfg((c) => ({ ...c, scriptId: e.target.value, customSystem: "" }))}
          >
            {SCRIPT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="label" style={{ marginTop: 14 }}>
            Mô tả sản phẩm / dịch vụ
          </div>
          <textarea
            rows={6}
            value={cfg.products}
            onChange={(e) => setCfg((c) => ({ ...c, products: e.target.value }))}
          />
          <div className="help">Càng chi tiết, chatbot càng tư vấn chính xác.</div>

          <details style={{ marginTop: 14 }}>
            <summary
              style={{
                cursor: "pointer",
                fontSize: 13,
                color: "var(--text-2)",
                userSelect: "none",
              }}
            >
              ⚙️ System prompt tùy chỉnh (nâng cao)
            </summary>
            <textarea
              rows={5}
              placeholder="Để trống để dùng kịch bản mặc định"
              value={cfg.customSystem}
              onChange={(e) => setCfg((c) => ({ ...c, customSystem: e.target.value }))}
              style={{ marginTop: 8 }}
            />
          </details>

          <div className="divider" />
          <div className="row">
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              ↺ Hội thoại mới
            </button>
            <span className="tag">{messages.length} tin</span>
          </div>
        </div>

        {/* Chat pane */}
        <div className="chat-pane">
          <div ref={scrollRef} className="chat-msgs">
            {messages.length === 0 && (
              <div className="empty">
                <div className="empty-emoji">💬</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  Sẵn sàng nhận khách
                </div>
                <div style={{ fontSize: 13, maxWidth: 380, margin: "0 auto" }}>
                  Nhập tin nhắn mẫu khách hàng để xem chatbot tư vấn. Mỗi hội thoại có hệ thống prompt
                  riêng theo cấu hình bên trái.
                </div>
                <div className="row" style={{ marginTop: 14, justifyContent: "center" }}>
                  {[
                    "Em ơi shop có áo thun không?",
                    "Đắt quá, bên kia bán rẻ hơn",
                    "Anh muốn đặt 2 cái áo size L",
                  ].map((q) => (
                    <button
                      key={q}
                      className="btn btn-ghost btn-sm"
                      onClick={() => setInput(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="msg bot" style={{ opacity: 0.7 }}>
                <span style={{ display: "inline-flex", gap: 4 }}>
                  <Dot delay={0} />
                  <Dot delay={150} />
                  <Dot delay={300} />
                </span>
              </div>
            )}
            {error && (
              <div className="msg bot" style={{ borderColor: "var(--bad)", color: "#fca5a5" }}>
                ⚠ {error}
              </div>
            )}
          </div>
          <div className="chat-input">
            <textarea
              placeholder="Nhập tin nhắn khách hàng... (Enter để gửi, Shift+Enter xuống dòng)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
            />
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={busy || !input.trim() || !cfg.apiKey[cfg.provider]}
            >
              {busy ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">System prompt đang dùng (preview)</div>
            <span className="tag tag-brand">{SCRIPT_TEMPLATES.find((t) => t.id === cfg.scriptId)?.name}</span>
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12.5,
              color: "var(--text-1)",
              background: "var(--bg-1)",
              padding: 14,
              borderRadius: 8,
              border: "1px solid var(--border)",
              maxHeight: 240,
              overflow: "auto",
            }}
          >
            {systemPrompt}
          </pre>
        </div>
      </div>
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: "var(--text-2)",
        animation: `bz-blink 1s ${delay}ms infinite`,
        display: "inline-block",
      }}
    >
      <style>{`@keyframes bz-blink { 0%, 80%, 100% { opacity: 0.2 } 40% { opacity: 1 } }`}</style>
    </span>
  );
}
