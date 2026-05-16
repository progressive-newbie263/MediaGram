import { useState } from "react";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const AuthPage = () => {
  const { login, register, isLoading } = useAuthStore();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result =
      mode === "login"
        ? await login({ email: form.email, password: form.password })
        : await register({
            email: form.email,
            password: form.password,
            username: form.username,
            displayName: form.displayName || form.username,
          });

    if (!result.success) toast.error(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-gradient opacity-10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold brand-gradient-text">MediaGram</h1>
          <p className="text-white/50 text-sm mt-2">Connect. Share. Explore.</p>
        </div>

        <div className="flex rounded-xl bg-surface-800 p-1 mb-6">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                mode === m ? "bg-brand-500 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <input
                className="input-field"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <input
                className="input-field"
                placeholder="Display name (optional)"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </>
          )}
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "login" && (
          <p className="text-center text-white/40 text-xs mt-6">
            Demo: alice@example.com / password123
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
