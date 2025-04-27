export default function Custom500() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">500 - Server Error</h1>
      <p className="text-gray-500 mt-4">Something went wrong. We'll sew it up soon!</p>
      <a href="/" className="text-blue-500 hover:underline mt-4">Back to Home</a>
    </div>
  );
}

