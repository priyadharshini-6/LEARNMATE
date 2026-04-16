import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { question, documentId } = await req.json();

    if (!question || !documentId) {
      return new Response(JSON.stringify({ error: "Missing question or documentId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing question for document ${documentId}: ${question}`);

    const { data: chunks, error: chunksError } = await supabase
      .from("document_chunks")
      .select("content, page_number, chunk_index")
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .order("chunk_index");

    if (chunksError) {
      console.error("Chunks error:", chunksError);
      return new Response(JSON.stringify({ error: "Failed to fetch document" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chunks || chunks.length === 0) {
      return new Response(JSON.stringify({ 
        answer: "No content found in this document. Please ensure the document was processed correctly.",
        citations: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${chunks.length} chunks for document`);

    const questionLower = question.toLowerCase();
    const questionWords = questionLower
      .split(/\s+/)
      .filter((w: string) => w.length > 2)
      .filter((w: string) => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'would', 'could', 'what', 'when', 'where', 'which', 'their', 'will', 'with', 'this', 'that', 'from', 'they', 'been'].includes(w));

    const scoredChunks = chunks.map((chunk: any) => {
      const content = chunk.content.toLowerCase();
      let score = 0;
      
      if (content.includes(questionLower)) {
        score += 10;
      }
      
      for (const word of questionWords) {
        const matches = (content.match(new RegExp(word, 'gi')) || []).length;
        score += matches * 2;
      }
      
      const wordCount = content.split(/\s+/).length;
      const density = score / (wordCount / 100);
      
      return { ...chunk, score: score + density };
    });

    scoredChunks.sort((a: any, b: any) => b.score - a.score);
    
    const topChunks = scoredChunks.slice(0, 8);
    const context = topChunks.map((c: any, i: number) => 
      `[Source ${i + 1}${c.page_number ? `, Page ${c.page_number}` : ''}]:\n${c.content}`
    ).join("\n\n---\n\n");

    console.log(`Using ${topChunks.length} chunks for context`);

    const isOpenRouter = openaiApiKey.startsWith("sk-or-");
    const apiUrl = isOpenRouter 
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    
    const model = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
    
    console.log(`Using ${isOpenRouter ? 'OpenRouter' : 'OpenAI'} API with model: ${model}`);

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
        ...(isOpenRouter && { "HTTP-Referer": "https://learnmateio.lovable.app" }),
        ...(isOpenRouter && { "X-Title": "Learn Mate" }),
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are Learn Mate, an expert AI study assistant designed to help students learn effectively from their documents.

Your role is to provide comprehensive, educational answers that:
1. **Directly answer the question** using ONLY information from the provided document context
2. **Explain concepts thoroughly** - break down complex topics into understandable parts
3. **Provide examples** when relevant to illustrate points
4. **Use clear structure** - use headings, bullet points, and numbered lists for clarity
5. **Cite your sources** - reference which parts of the document support your answer

IMPORTANT RULES:
- Base your answers STRICTLY on the document content provided
- If the information is not in the document, clearly state: "I couldn't find this specific information in your document. The document covers [related topics you did find]."
- Never make up or assume information not present in the context
- Be thorough but focused - provide detail relevant to the question
- Use markdown formatting for better readability`,
          },
          {
            role: "user",
            content: `Here is the relevant content from the user's document:

${context}

---

**User's Question:** ${question}

Please provide a detailed, educational answer based on the document content above.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 401) {
        return new Response(JSON.stringify({ error: "AI service authentication failed. Please check your API key." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Insufficient credits. Please add funds to your API account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || "Unable to generate answer.";

    console.log("Successfully generated answer");

    const citations = topChunks
      .filter((c: any) => c.score > 0)
      .slice(0, 5)
      .map((c: any) => ({
        page: c.page_number || 1,
        text: c.content.length > 200 ? c.content.substring(0, 200) + "..." : c.content,
      }));

    return new Response(JSON.stringify({ answer, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("RAG query error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
