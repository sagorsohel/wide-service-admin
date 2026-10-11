import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setCredentials } from "@/redux/slices/authSlice";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleFillCredentials = (phoneVal: string, passVal: string) => {
    setPhone(phoneVal);
    setPassword(passVal);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || !password) {
      setErrorMessage("Please enter both phone number and password");
      return;
    }

    try {
      const response = await login({ phone: trimmedPhone, password }).unwrap();

      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: {
              id: response.data.id,
              name: response.data.name,
              phone: response.data.phone,
              email: response.data.email,
              role: response.data.role,
            },
            token: response.data.token,
          })
        );
        // Navigate based on successful credentials
        navigate("/dashboard", { replace: true });
      } else {
        setErrorMessage(response.message || "Invalid phone number or password.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Invalid phone number or password from database.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-lg shadow-blue-500/30">
            W
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Wide Service Admin
          </h1>
          <p className="text-sm text-slate-500">
            Enter your phone and password to sign in
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-slate-200/80 bg-white/95 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800">Admin Login</CardTitle>
            <CardDescription>
              Sign in with your phone number and password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Creator Sign-Up Callout */}
            <div className="pt-2 text-center">
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between gap-3 text-left">
                <div>
                  <p className="text-xs font-bold text-indigo-950">New Service Provider?</p>
                  <p className="text-[11px] text-indigo-700">List and manage your offerings</p>
                </div>
                <Link
                  to="/creator-sign-up"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 inline-flex items-center gap-1"
                >
                  Join as Creator →
                </Link>
              </div>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-medium text-slate-400 uppercase text-center mb-2">
                Quick-Fill Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillCredentials("01865625788", "12345678")}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-800">Super Admin</p>
                  <p className="text-[11px] text-slate-500 font-mono">01865625788</p>
                  <p className="text-[10px] text-slate-400">Pass: 12345678</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillCredentials("01865625789", "12345678")}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-800">Creator User</p>
                  <p className="text-[11px] text-slate-500 font-mono">01865625789</p>
                  <p className="text-[10px] text-slate-400">Pass: 12345678</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          Connected to backend API: <span className="font-mono text-slate-600">http://localhost:5000</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
