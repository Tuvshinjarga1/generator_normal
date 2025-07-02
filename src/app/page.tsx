"use client";

import { useState } from "react";
import {
  Cloud,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Download,
  Save,
} from "lucide-react";
import Image from "next/image";

interface ContentData {
  title: string;
  content: string;
  imageUrl: string;
  tags: string[];
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [content, setContent] = useState<ContentData | null>(null);

  const generateContent = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, generateImage: false }),
      });

      if (!response.ok) {
        throw new Error("Контент үүсгэхэд алдаа гарлаа");
      }

      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error("Алдаа:", error);
      alert("Контент үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!content?.title) return;

    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: content.title,
          topic: topic,
          tags: content.tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Зураг үүсгэхэд алдаа гарлаа");
      }

      const data = await response.json();
      setContent((prev) =>
        prev ? { ...prev, imageUrl: data.imageUrl } : null
      );
    } catch (error) {
      console.error("Алдаа:", error);
      alert("Зураг үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = async () => {
    if (!content?.imageUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch("/api/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: content.imageUrl,
          title: content.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Зураг татахэд алдаа гарлаа");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${content.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Алдаа:", error);
      alert("Зураг татахэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cloud className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Cloud Content Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Cloud-тэй холбоотой сүүлийн үеийн мэдээлэл, технологийн шийдлүүдийг
            мэргэжлийн бичээчийн хэлбэрээр үүсгэж өгдөг систем
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Cloud-тэй холбоотой сэдэв оруулна уу (жишээ: AWS Lambda, Kubernetes, Serverless Architecture...)"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => e.key === "Enter" && generateContent()}
              />
              <button
                onClick={generateContent}
                disabled={isLoading || !topic.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isLoading ? "Үүсгэж байна..." : "Контент үүсгэх"}
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {content && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Image Section */}
              <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                {content.imageUrl ? (
                  <div className="absolute inset-0">
                    <Image
                      src={content.imageUrl}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white opacity-20" />
                  </div>
                )}

                {/* Image Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {!content.imageUrl ? (
                    <button
                      onClick={generateImage}
                      disabled={isGeneratingImage}
                      className="px-4 py-2 bg-white bg-opacity-90 hover:bg-opacity-100 disabled:bg-opacity-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg"
                    >
                      {isGeneratingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isGeneratingImage
                        ? "Зураг үүсгэж байна..."
                        : "Зураг үүсгэх"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={generateImage}
                        disabled={isGeneratingImage}
                        className="px-3 py-2 bg-white bg-opacity-90 hover:bg-opacity-100 disabled:bg-opacity-50 text-gray-800 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg text-sm"
                      >
                        {isGeneratingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        {isGeneratingImage ? "..." : "Шинэ"}
                      </button>
                      <button
                        onClick={downloadImage}
                        disabled={isDownloading}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg text-sm"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isDownloading ? "Татаж байна..." : "Татах"}
                      </button>
                    </>
                  )}
                </div>

                {/* Image Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg">
                    <p className="text-sm">Зураг: {content.title}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {content.title}
                </h2>

                {/* Tags */}
                {content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {content.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Main Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {content.content.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>© 2024 Cloud Content Generator - Cloud технологийн мэдээлэл</p>
        </div>
      </div>
    </div>
  );
}
