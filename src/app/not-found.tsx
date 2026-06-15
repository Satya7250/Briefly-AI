import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8">
      <div className="max-w-md text-center space-y-6">
        {/* Illustration */}
        <Image
          src="/404-illustration.png"
          alt="404 illustration"
          width={400}
          height={300}
          className="mx-auto"
          priority
        />
        <h1 className="text-5xl font-bold text-gray-800">404 – Page Not Found</h1>
        <p className="text-lg text-gray-600">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition"
        >
          Go Home
        </Link>
      </div>
    </section>
  );
}
