import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  journal: `You are a warm, empathetic mental health companion for a young person's journal. 
When given a journal entry, respond with:
- A brief validating statement (1 sentence)
- A gentle insight or reflection (1 sentence)  
- A small actionable suggestion (1 sentence)
Keep it under 50 words total. Use a warm, non-clinical tone. Use 1-2 relevant emojis.`,

  empathy: `You are an empathy translator for a parent/caretaker of a child with mental health challenges.
Given the child's current mood level (0-100) and weather status (sunny/cloudy/stormy), generate:
- A brief status summary (1 sentence)
- 2-3 specific, actionable pieces of advice for the parent
- A reassurance note
Keep it under 80 words. Be warm but practical. Do NOT reveal any raw journal content. Use emojis sparingly.`,

  doctor: `You are a clinical AI assistant for a psychiatrist/therapist.
Given a patient's mood history data (array of mood scores 0-100 and sleep hours), provide:
- A trend analysis (1-2 sentences)
- Risk flags if any (e.g., declining trend, sleep disruption)
- A recommended focus area for the next session
Keep it professional, concise (under 80 words), and evidence-informed.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    let userMessage = "";
    if (type === "journal") {
      userMessage = `Journal entry: "${data.text}"`;
    } else if (type === "empathy") {
      userMessage = `Child's mood level: ${data.mood}/100. Weather status: ${data.weather}. Stress level: ${data.mood > 80 ? "low" : data.mood > 40 ? "moderate" : "high"}.`;
    } else if (type === "doctor") {
      userMessage = `Patient mood history (last 7 days): ${JSON.stringify(data.moodHistory)}. Average mood: ${Math.round(data.moodHistory.reduce((s: number, e: any) => s + e.mood, 0) / data.moodHistory.length)}. Average sleep: ${(data.moodHistory.reduce((s: number, e: any) => s + e.sleep, 0) / data.moodHistory.length).toFixed(1)}h.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
