import Link from "next/link";

type SearchParams = { error?: string; next?: string };

export const metadata = { title: "Staff Login — Dave's Mobile Shop" };

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-white">Staff sign in</h1>
        <p className="mt-1 text-sm text-gray-400">Inventory and order management.</p>

        {sp.error && (
          <div className="mt-4 rounded-md bg-red-900/30 border border-red-700/50 text-red-300 text-sm p-3">
            Incorrect password.
          </div>
        )}

        <form action="/api/auth/login" method="POST" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={sp.next || "/admin/dashboard"} />
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              className="input"
              type="password"
              id="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full">Sign in</button>
        </form>

        <p className="mt-6 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-300">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}
