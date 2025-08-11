import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const mockSeries = Array.from({ length: 14 }).map((_, i) => ({ day: `D${i+1}`, visitors: Math.round(50 + Math.random()*100), clicks: Math.round(10 + Math.random()*40) }));
const mockTop = Array.from({ length: 5 }).map((_, i) => ({ title: `Video ${i+1}`, views: Math.round(200 + Math.random()*1000), likes: Math.round(50 + Math.random()*300) }));

export default function Dashboard() {
  useEffect(() => { document.title = "Dashboard | TheShopping Admin"; }, []);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Visitors</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{mockSeries.reduce((a, b)=> a+b.visitors, 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Buy Button Clicks</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{mockSeries.reduce((a, b)=> a+b.clicks, 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Most Liked Videos</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">{mockTop.map(v=> <Badge key={v.title}>{v.title}</Badge>)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Visitors over time</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Buy clicks over time</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Tabs defaultValue="views">
        <TabsList>
          <TabsTrigger value="views">Top Viewed</TabsTrigger>
          <TabsTrigger value="likes">Top Liked</TabsTrigger>
        </TabsList>
        <TabsContent value="views">
          <div className="grid gap-2 md:grid-cols-2">
            {mockTop.map((v) => (
              <Card key={v.title}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{v.title}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Views: {v.views}</CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="likes">
          <div className="grid gap-2 md:grid-cols-2">
            {mockTop.map((v) => (
              <Card key={v.title}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{v.title}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Likes: {v.likes}</CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
