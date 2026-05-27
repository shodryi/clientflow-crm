// Cantidad de leads agrupados por status.
export type LeadStatusCount = {
  status: "new" | "contacted" | "quoted" | "closed" | "lost";
  count: number;
};

// Cantidad de leads agrupados por source.
export type LeadSourceCount = {
  source: string;
  count: number;
};

// Lead reciente que devuelve GET /dashboard/stats.
export type RecentLead = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientId: number | null;
};

// Respuesta completa de GET /dashboard/stats.
export type DashboardStats = {
  totals: {
    leads: number;
    clients: number;
    notes: number;
  };

  activity: {
    leadsCreatedToday: number;
    leadsCreatedThisMonth: number;
  };

  performance: {
    closedLeads: number;
    lostLeads: number;
    conversionRate: number;
    lostRate: number;
  };

  leadsByStatus: LeadStatusCount[];

  leadsBySource: LeadSourceCount[];

  recentLeads: RecentLead[];
};