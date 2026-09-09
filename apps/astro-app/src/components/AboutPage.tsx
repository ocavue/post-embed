export default function AboutPage() {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        About
      </h1>

      <div className="mt-6 text-center">
        <a
          href="/"
          className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
