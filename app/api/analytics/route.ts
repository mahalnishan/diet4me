import { NextRequest, NextResponse } from "next/server";

// In-memory storage for analytics (in production, use a database)
let analyticsData: Array<{
  id: string;
  ip: string;
  timestamp: Date;
  userAgent: string;
  age: string;
  height: string;
  weight: string;
  bmi: string;
  bmiCategory: string;
  activityLevel: string;
  healthConditions: string[];
  dietPreference: string;
  fileUploaded: boolean;
  fileName?: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const analyticsEntry = {
      id: crypto.randomUUID(),
      ip,
      timestamp: new Date(),
      userAgent,
      age: body.age || '',
      height: body.height || '',
      weight: body.weight || '',
      bmi: body.bmi || '',
      bmiCategory: body.bmiCategory || '',
      activityLevel: body.activityLevel || '',
      healthConditions: body.healthConditions || [],
      dietPreference: body.dietPreference || '',
      fileUploaded: body.fileUploaded || false,
      fileName: body.fileName || undefined,
    };

    analyticsData.push(analyticsEntry);

    return NextResponse.json({ success: true, id: analyticsEntry.id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Group by IP address
    const ipStats = analyticsData.reduce((acc, entry) => {
      if (!acc[entry.ip]) {
        acc[entry.ip] = {
          ip: entry.ip,
          count: 0,
          lastGenerated: entry.timestamp,
          firstGenerated: entry.timestamp,
          dietPreferences: new Set(),
          activityLevels: new Set(),
          totalHealthConditions: 0,
        };
      }
      
      acc[entry.ip].count++;
      acc[entry.ip].lastGenerated = new Date(Math.max(acc[entry.ip].lastGenerated.getTime(), entry.timestamp.getTime()));
      acc[entry.ip].firstGenerated = new Date(Math.min(acc[entry.ip].firstGenerated.getTime(), entry.timestamp.getTime()));
      acc[entry.ip].dietPreferences.add(entry.dietPreference);
      acc[entry.ip].activityLevels.add(entry.activityLevel);
      acc[entry.ip].totalHealthConditions += entry.healthConditions.length;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and format
    const formattedStats = Object.values(ipStats).map((stat: any) => ({
      ...stat,
      dietPreferences: Array.from(stat.dietPreferences),
      activityLevels: Array.from(stat.activityLevels),
      avgHealthConditions: Math.round((stat.totalHealthConditions / stat.count) * 10) / 10,
    }));

    // Sort by count descending
    formattedStats.sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalGenerations: analyticsData.length,
      uniqueIPs: formattedStats.length,
      ipStats: formattedStats,
      recentGenerations: analyticsData
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(entry => ({
          id: entry.id,
          ip: entry.ip,
          timestamp: entry.timestamp,
          dietPreference: entry.dietPreference,
          activityLevel: entry.activityLevel,
        })),
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
