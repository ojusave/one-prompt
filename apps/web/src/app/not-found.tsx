import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-medium">Run not found</h1>
      <p className="mt-2 text-text-secondary">This execution does not exist.</p>
      <Link href="/" className="mt-6 text-accent hover:underline">
        Return to workspace
      </Link>
    </div>
  );
}
