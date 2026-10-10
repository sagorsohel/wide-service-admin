import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShoppingBag, Activity, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useAppSelector } from "@/redux/store";

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      title: "Total Service Bookings",
      value: "1,248",
      change: "+12.5%",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Users",
      value: "8,940",
      change: "+8.2%",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Total Revenue",
      value: "$42,650",
      change: "+23.1%",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "App Sync Rate",
      value: "99.9%",
      change: "+0.4%",
      icon: Activity,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
            {user?.role === "superadmin" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Access
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Creator Portal Access
              </>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || "Administrator"}!
          </h2>
          <p className="text-sm text-blue-100">
            Logged in with phone: <span className="font-mono font-medium">{user?.phone}</span> • Connected dynamically via MySQL & Redux Toolkit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xs">
            Export Reports
          </Button>
          <Button className="bg-blue-800 hover:bg-blue-900 text-white border border-blue-400/30">
            Create Service
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <span>{stat.change}</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connected Architecture Status */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture & Dynamic Database Status</CardTitle>
          <CardDescription>Wide Service Multi-tier deployment links & database connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-backend</p>
                <p className="text-xs text-slate-500">Express.js + Drizzle ORM + MySQL (wideservice)</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Connected (Port 5000)
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-admin</p>
                <p className="text-xs text-slate-500">React + React Router v7 + Redux Toolkit RTK Query</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Active Session
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-web</p>
                <p className="text-xs text-slate-500">Next.js App Router + shadcn/ui</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Ready
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-app</p>
                <p className="text-xs text-slate-500">React Native Expo SDK 57 Client</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Ready
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
