import LoginForm from "../../components/admin/LoginForm";

/**
 * Admin sign-in at /admin/login.
 */
export default function AdminLoginPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-20 sm:px-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to manage the gallery
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
