import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, topic, tags } = await request.json();

    if (!title || !topic) {
      return NextResponse.json(
        { error: "Гарчиг болон сэдэв шаардлагатай" },
        { status: 400 }
      );
    }

    // Зургийн үүсгэлтийн prompt
    const imagePrompt = `Modern, professional illustration of ${topic} in cloud computing context. 
    The image should represent: ${title}
    Related technologies: ${tags?.join(", ") || topic}
    
    Style: Clean, minimalist design with blue and white color scheme. 
    Suitable for technology blog or professional presentation. 
    High quality, detailed but not cluttered.`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data?.[0]?.url || "";

    if (!imageUrl) {
      throw new Error("Зураг үүсгэхэд алдаа гарлаа");
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      success: true,
    });
  } catch (error) {
    console.error("Зургийн API алдаа:", error);
    return NextResponse.json(
      { error: "Зураг үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
