import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ServicesPage: React.FC = () => {
  const services = [
    { id: 1, title: "AC Maintenance & Repair", category: "Electronics", price: "$49", status: "Active" },
    { id: 2, title: "Home Plumbing Service", category: "Utility", price: "$35", status: "Active" },
    { id: 3, title: "Electrical Wiring & Check", category: "Electrical", price: "$40", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Services Catalog</h2>
          <p className="text-sm text-slate-500">Configure offerings available across Web & Mobile apps.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {service.category}
              </span>
              <CardTitle className="text-base">{service.title}</CardTitle>
              <CardDescription>Base Starting Price: {service.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                {service.status}
              </span>
              <Button variant="outline" size="sm">
                Edit Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
