export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-4">Maybe the socks wandered off...</p>
      <a href="/" className="text-blue-500 hover:underline mt-4">Back to Home</a>
    </div>
  );
}

