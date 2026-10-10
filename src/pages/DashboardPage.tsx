import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, ShoppingBag, Activity } from "lucide-react";

export const DashboardPage: React.FC = () => {
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500">
            Real-time management for Wide Service Mobile App, Web, and Operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Export Reports</Button>
          <Button>Create Service</Button>
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

      {/* Connected Repositories Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Status</CardTitle>
          <CardDescription>Wide Service Multi-tier deployment links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-app</p>
                <p className="text-xs text-slate-500">React Native Expo Mobile Client</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                Ready
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-admin</p>
                <p className="text-xs text-slate-500">React + React Router v7 + shadcn/ui</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                Current App
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">wide-service-web</p>
                <p className="text-xs text-slate-500">Next.js App Router + shadcn/ui</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">
                Verified
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
