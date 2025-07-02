import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic, generateImage = false } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Сэдэв оруулах шаардлагатай" },
        { status: 400 }
      );
    }

    // Cloud-тэй холбоотой контент үүсгэх prompt
    const contentPrompt = `
Та бол cloud технологийн мэргэжлийн бичээч. Дараах сэдэвтэй холбоотой сонирхолтой, 
сүүлийн үеийн мэдээлэл агуулсан нийтлэл бичнэ үү:

Сэдэв: ${topic}

Нийтлэл нь дараах бүтэцтэй байх ёстой:
1. Гоо үзэмжтэй, сонирхолтой гарчиг
2. 3-4 догол мөрөөс бүрдсэн үндсэн агуулга
3. Cloud технологийн практик жишээнүүд
4. Сүүлийн үеийн хөгжлийн мэдээлэл
5. Ирээдүйн чиглэлүүд

Хариултыг дараах JSON форматтай болгоно уу:
{
  "title": "Гарчиг",
  "content": "Бүтэн агуулга",
  "tags": ["tag1", "tag2", "tag3"],
  "imageDescription": "Зургийн тайлбар"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Та бол cloud технологийн мэргэжлийн бичээч. Монгол хэлээр бичнэ.",
        },
        {
          role: "user",
          content: contentPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("OpenAI-аас хариулт ирээгүй");
    }

    // JSON хариултыг parse хийх
    let parsedResponse;
    try {
      // JSON хэсгийг олж авах
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON формат олдсонгүй");
      }
    } catch (parseError) {
      // JSON parse хийхэд алдаа гарвал энгийн форматтай болгох
      parsedResponse = {
        title: `${topic} - Cloud технологийн шийдлүүд`,
        content: responseText,
        tags: [topic, "Cloud", "Technology"],
        imageDescription: `${topic} cloud technology illustration`,
      };
    }

    // Зургийн үүсгэлтийг салгаж, зөвхөн контент буцаана
    return NextResponse.json({
      title: parsedResponse.title,
      content: parsedResponse.content,
      tags: parsedResponse.tags || [topic, "Cloud", "Technology"],
      imageUrl: "", // Зураг хоосон байна
    });
  } catch (error) {
    console.error("API алдаа:", error);
    return NextResponse.json(
      { error: "Контент үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
