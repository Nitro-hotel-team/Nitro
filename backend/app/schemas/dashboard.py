"""
Schemas: Dashboard Metrics
"""
from pydantic import BaseModel
from typing import Optional, Dict


class DashboardMetrics(BaseModel):
    revenue: float = 0
    revenueGrowth: float = 0
    totalBookings: int = 0
    occupancyRate: float = 0
    revPar: float = 0
    adr: float = 0
    cancelRate: float = 0
    channelBreakdown: Dict[str, float] = {}
