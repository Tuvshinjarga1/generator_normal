import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, title } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Зургийн URL шаардлагатай" },
        { status: 400 }
      );
    }

    // Зургийг fetch хийх
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Зураг татахэд алдаа гарлаа");
    }

    // Зургийн blob авах
    const imageBlob = await imageResponse.blob();

    // Response буцаах
    return new NextResponse(imageBlob, {
      headers: {
        "Content-Type":
          imageResponse.headers.get("content-type") || "image/png",
        "Content-Disposition": `attachment; filename="${
          title?.replace(/[^a-zA-Z0-9]/g, "_") || "cloud-image"
        }.png"`,
      },
    });
  } catch (error) {
    console.error("Зургийн татах алдаа:", error);
    return NextResponse.json(
      { error: "Зураг татахэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
