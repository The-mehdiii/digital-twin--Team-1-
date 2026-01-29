import Link from "next/link";

export default function Home() {
  return (
    <main className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Digital Twin Chatbot</h1>
        <p className="text-gray-600 mb-8">
          AI-powered conversational interface for Mehdi's portfolio
        </p>
        <div className="space-y-4">
          <Link
            href="/chat"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Chat
          </Link>
          <p className="text-gray-500 text-sm">
            Week 3: Interactive chatbot with AI streaming ✓
          </p>
        </div>
      </div>
    </main>
  );
}
