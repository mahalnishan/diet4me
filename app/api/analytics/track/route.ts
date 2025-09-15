import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventType,
      eventName,
      sessionId,
      userId,
      properties = {},
      pageUrl,
      referrer
    } = body;

    // Get client info
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               request.headers.get('cf-connecting-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert analytics event
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        event_name: eventName,
        session_id: sessionId,
        user_id: userId,
        ip_address: ip,
        user_agent: userAgent,
        page_url: pageUrl,
        referrer: referrer,
        properties: properties
      }])
      .select();

    if (error) {
      console.error('Analytics tracking error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0] 
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track analytics event' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    if (type) {
      query = query.eq('event_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Analytics fetch error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data 
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch analytics data' 
    }, { status: 500 });
  }
}
