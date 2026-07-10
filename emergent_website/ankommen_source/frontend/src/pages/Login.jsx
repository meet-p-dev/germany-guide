import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Log in — Ankommen"; }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate(location.state?.from || "/dashboard");
    else setError(res.error);
  };

  return (
    <div className="App relative">
      <div className="grain" />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto flex max-w-md flex-col px-5 py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">Log in to pick up where you left off.</p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {error && <p data-testid="login-error" className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" data-testid="login-submit" disabled={loading} className="w-full gap-2 rounded-full font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Log in
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
              No account yet? <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
