// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// @ts-ignore: Deno global
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  journal: `You are a clinical AI research assistant. Analyze the member's journal entry for emotional depth. 
Provide a reflection (max 2 sentences) and a sentiment score (0.0 to 1.0).
Response MUST be valid JSON: {"content": "reflection", "sentiment": 0.5}`,

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

  insight: `You are a longitudinal mental health AI analyzer.
Given a 14-day window of mood scores, sleep data, and stressors, provide:
- A correlation analysis (1 sentence, e.g., "Mood dips follow sleep below 6h")
- A proactive recommendation for the upcoming week
- A summary of the emotional "climate"
Keep it professional, analytical, and under 100 words.`,
};

// @ts-ignore: Request type
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  try {
    const { type, data, userId } = await req.json() as { type: string; data: any; userId?: string };

    // @ts-ignore: Deno is available in Supabase Edge Functions
    const GEMINI_API_KEY = (Deno as any).env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Initialize Supabase for logging
    const supabase = createClient(
      // @ts-ignore
      (Deno as any).env.get("SUPABASE_URL"),
      // @ts-ignore
      (Deno as any).env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    let userMessage = "";
    if (type === "journal") {
      userMessage = `Journal entry: "${data.text}"`;
    } else if (type === "empathy") {
      userMessage = `Child's mood level: ${data.mood}/100. Weather status: ${data.weather}. Stress level: ${data.mood > 80 ? "low" : data.mood > 40 ? "moderate" : "high"}.`;
    } else if (type === "doctor") {
      userMessage = `Patient mood history (last 7 days): ${JSON.stringify(data.moodHistory)}. Average mood: ${Math.round(data.moodHistory.reduce((s: number, e: any) => s + e.mood, 0) / data.moodHistory.length)}. Average sleep: ${(data.moodHistory.reduce((s: number, e: any) => s + e.sleep, 0) / data.moodHistory.length).toFixed(1)}h.`;
    } else if (type === "insight") {
      userMessage = `14-Day Longitudinal Data: ${JSON.stringify(data.history)}. Context: The patient has been tracking mood and sleep daily. Identify correlations between sleep, mood, and any reported stressors in the data.`;
    }

    const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", response.status, errorData);
      throw new Error("AI gateway error");
    }

    const result = await response.json() as any;
    let content = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    let sentimentScore = null;

    if (type === 'journal' || type === 'insight') {
      try {
        // Find JSON block if AI wrapped it in markdown
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        content = parsed.content || content;
        sentimentScore = parsed.sentiment || null;
      } catch (e) {
        console.warn("Failed to parse AI JSON response:", e);
      }
    }

    const latency = Date.now() - startTime;

    // Extract security metadata
    const ipAddress = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    const userAgent = req.headers.get("user-agent");

    // Log the interaction
    await supabase.from('ai_logs').insert({
      user_id: userId,
      type,
      prompt: fullPrompt,
      response: content,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: {
        latency,
        sentiment: sentimentScore,
        model: 'gemini-1.5-flash',
        finish_reason: result.candidates?.[0]?.finishReason
      }
    });

    return new Response(JSON.stringify({ content, sentiment: sentimentScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
