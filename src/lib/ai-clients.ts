export type Provider = "anthropic" | "openai" | "gemini";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type ChatRequest = {
  provider: Provider;
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

export type ChatResponse = {
  text: string;
  raw?: unknown;
};

export const PROVIDERS: Record<Provider, { label: string; defaultModel: string; models: string[]; help: string }> = {
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-haiku-4-5-20251001",
    models: [
      "claude-opus-4-7",
      "claude-sonnet-4-6",
      "claude-haiku-4-5-20251001",
    ],
    help: "Lấy API key tại console.anthropic.com → API Keys",
  },
  openai: {
    label: "OpenAI (GPT)",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    help: "Lấy API key tại platform.openai.com → API keys",
  },
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-1.5-flash",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
    help: "Lấy API key tại aistudio.google.com → Get API key (miễn phí)",
  },
};

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  if (!req.apiKey || !req.apiKey.trim()) {
    throw new Error("Chưa nhập API key cho nhà cung cấp này.");
  }
  switch (req.provider) {
    case "anthropic":
      return chatAnthropic(req);
    case "openai":
      return chatOpenAI(req);
    case "gemini":
      return chatGemini(req);
  }
}

async function chatAnthropic(req: ChatRequest): Promise<ChatResponse> {
  const body = {
    model: req.model || PROVIDERS.anthropic.defaultModel,
    max_tokens: req.maxTokens ?? 1024,
    system: req.systemPrompt || undefined,
    messages: req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content })),
    temperature: req.temperature ?? 0.7,
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await safeText(res);
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = Array.isArray(data?.content)
    ? data.content.map((b: { text?: string }) => b.text || "").join("")
    : "";
  return { text, raw: data };
}

async function chatOpenAI(req: ChatRequest): Promise<ChatResponse> {
  const messages: { role: string; content: string }[] = [];
  if (req.systemPrompt) messages.push({ role: "system", content: req.systemPrompt });
  for (const m of req.messages) {
    if (m.role === "system") continue;
    messages.push({ role: m.role, content: m.content });
  }
  const body = {
    model: req.model || PROVIDERS.openai.defaultModel,
    messages,
    temperature: req.temperature ?? 0.7,
    max_tokens: req.maxTokens ?? 1024,
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await safeText(res);
    throw new Error(`OpenAI API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return { text, raw: data };
}

async function chatGemini(req: ChatRequest): Promise<ChatResponse> {
  const model = req.model || PROVIDERS.gemini.defaultModel;
  const contents = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: req.temperature ?? 0.7,
      maxOutputTokens: req.maxTokens ?? 1024,
    },
  };
  if (req.systemPrompt) {
    body.systemInstruction = { parts: [{ text: req.systemPrompt }] };
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(req.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await safeText(res);
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("") ?? "";
  return { text, raw: data };
}

async function safeText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 400);
  } catch {
    return res.statusText;
  }
}

// Built-in sales script templates — Vietnamese e-commerce / service business.
export const SCRIPT_TEMPLATES = [
  {
    id: "consult",
    name: "Tư vấn sản phẩm",
    body: `Bạn là chuyên viên tư vấn bán hàng của {SHOP_NAME}, thân thiện, lịch sự, dùng tiếng Việt tự nhiên.

Sản phẩm/dịch vụ của shop:
{PRODUCTS}

Cách trò chuyện:
- Chào hỏi nồng nhiệt, gọi khách là "anh/chị".
- Hỏi nhu cầu cụ thể trước khi giới thiệu sản phẩm.
- Gợi ý 1-2 sản phẩm phù hợp nhất, kèm điểm nổi bật.
- Trả lời ngắn gọn (dưới 4 câu), không quảng cáo dồn dập.
- Nếu khách quan tâm, hỏi tên + SĐT để gửi báo giá chi tiết.
- Không bịa giá / chương trình khuyến mãi không có trong tài liệu.`,
  },
  {
    id: "objection",
    name: "Xử lý từ chối / so sánh giá",
    body: `Bạn là sale closer của {SHOP_NAME}. Khách thường lăn tăn về giá, chất lượng, hoặc so sánh với bên khác. Nhiệm vụ của bạn:

1. **Đồng cảm** trước, không phản bác ngay ("Em hiểu, giá đúng là cân nhắc lớn ạ...").
2. **Làm rõ** giá trị: chất lượng / bảo hành / dịch vụ sau bán có gì khác bên kia.
3. **Đưa ra giải pháp** trung gian: gói nhỏ hơn, trả góp, ưu đãi giới hạn.
4. **Cam kết hỗ trợ**: đổi trả 7 ngày, hotline 24/7, v.v.

Sản phẩm/dịch vụ:
{PRODUCTS}

Luôn dùng tiếng Việt thân thiện, không bốc đồng. Kết thúc bằng câu hỏi để giữ hội thoại.`,
  },
  {
    id: "close",
    name: "Chốt đơn / lấy thông tin",
    body: `Bạn là sale của {SHOP_NAME}, mục tiêu trong cuộc chat này là **chốt đơn hoặc lấy thông tin** (tên, SĐT, địa chỉ).

Quy trình:
1. Khi khách bày tỏ ý định mua/quan tâm rõ ràng → xác nhận sản phẩm + số lượng.
2. Hỏi địa chỉ giao + SĐT nhận hàng.
3. Tóm tắt đơn: "Em xin xác nhận đơn của anh/chị: [sản phẩm], [số lượng], giao về [địa chỉ], SĐT [số]. Đúng chưa ạ?"
4. Cảm ơn + hẹn thời gian giao hàng + chốt câu "Em sẽ liên hệ lại trong vòng X phút".

Sản phẩm:
{PRODUCTS}

Tuyệt đối KHÔNG bịa giá. Nếu không có giá → nói "Em sẽ check giá tốt nhất và gọi lại anh/chị trong 5 phút, anh/chị cho em xin SĐT nhé?"`,
  },
];
