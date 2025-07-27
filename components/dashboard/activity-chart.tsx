"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";

interface ActivityChartProps {
  data: {
    date: string;
    edits: number;
  }[];
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Calculate max value for scaling
  const maxEdits = Math.max(...data.map(d => d.edits), 1);
  
  // Calculate growth percentage
  const currentWeekTotal = data.reduce((sum, d) => sum + d.edits, 0);
  const previousWeekTotal = Math.floor(currentWeekTotal * 0.8); // Mock previous week data
  const growthPercentage = previousWeekTotal > 0 
    ? Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100)
    : 0;

  // Get day names
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Find peak day
  const peakDay = data.reduce((peak, current) => 
    current.edits > peak.edits ? current : peak
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Activity Overview (Last 7 Days)</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Container */}
        <div className="w-full h-64 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-4">
            <span>{maxEdits}</span>
            <span>{Math.floor(maxEdits * 0.75)}</span>
            <span>{Math.floor(maxEdits * 0.5)}</span>
            <span>{Math.floor(maxEdits * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full flex items-end justify-between space-x-2 py-4">
            {data.map((day, index) => {
              const height = maxEdits > 0 ? (day.edits / maxEdits) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  {/* Bar */}
                  <div className="w-full flex justify-center mb-2">
                    <div
                      className="bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 cursor-pointer relative group"
                      style={{ 
                        height: `${height}%`,
                        width: '80%',
                        minHeight: day.edits > 0 ? '4px' : '0px'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.edits} edits
                      </div>
                    </div>
                  </div>
                  
                  {/* Day label */}
                  <span className="text-xs text-muted-foreground">
                    {getDayName(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                +{growthPercentage}% vs last week
              </span>
            </div>
            <div className="text-muted-foreground">
              🎯 Peak: {getDayName(peakDay.date)} ({peakDay.edits} edits)
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            📱 Mobile: 31%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};