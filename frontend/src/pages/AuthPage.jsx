import { useState } from "react";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";

const AuthPage = () => {
  const { login, register, isLoading } = useAuthStore();
  const { t } = useTranslation();
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
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mesh-orb -left-16 top-10 h-72 w-72 bg-brand-500/25" />
      <div className="mesh-orb right-0 top-1/3 h-80 w-80 bg-cyan-400/20" style={{ animationDelay: "-5s" }} />
      <div className="mesh-orb bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 bg-blue-500/10" style={{ animationDelay: "-9s" }} />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="hidden lg:flex flex-col justify-between rounded-[2rem] border border-white/10 bg-surface-950/50 p-10 backdrop-blur-xl"
        >
          <div>
            <span className="section-kicker">{t("appName")}</span>
            <h1 className="font-display mt-5 max-w-xl text-5xl font-bold leading-tight text-white">
              {t("auth.heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
              {t("auth.heroText")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { title: t("auth.feature1Title"), text: t("auth.feature1Text") },
              { title: t("auth.feature2Title"), text: t("auth.feature2Text") },
              { title: t("auth.feature3Title"), text: t("auth.feature3Text") },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur-md">
                <p className="font-display text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              [t("auth.statRealtime"), "Socket.io"],
              [t("auth.statDb"), "PostgreSQL"],
              [t("auth.statUi"), "Motion + glass"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-surface-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</p>
                <p className="mt-2 font-display text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="glass-strong rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white shadow-lg shadow-brand-500/20">
                M
              </div>
              <h1 className="font-display text-3xl font-bold brand-gradient-text">{t("appName")}</h1>
              <p className="mt-2 text-sm text-white/50">{t("auth.title")}</p>
            </div>

            <div className="mt-8 flex rounded-2xl border border-white/10 bg-white/5 p-1.5">
              {[
                { key: "login", label: t("common.signIn") },
                { key: "register", label: t("common.createAccount") },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                    mode === m.key ? "bg-brand-500 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <>
                  <input
                    className="input-field"
                    placeholder={t("auth.username")}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder={t("auth.displayName")}
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  />
                </>
              )}
              <input
                type="email"
                className="input-field"
                placeholder={t("auth.email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                className="input-field"
                placeholder={t("auth.password")}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">
                {isLoading ? t("common.pleaseWait") : mode === "login" ? t("common.signIn") : t("common.createAccount")}
              </button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AuthPage;
