import { NextResponse } from 'next/server';
import { loadTiffinLoopDataset } from '@/lib/data-loader';
import { computeLeadershipAnalytics } from '@/lib/analytics-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const simulateOffboarding = searchParams.get('simulateOffboarding') === 'true';

    const dataset = await loadTiffinLoopDataset();
    const simulatedIds = simulateOffboarding ? ['CK080', 'CK062'] : [];

    const analytics = computeLeadershipAnalytics(dataset, simulatedIds);
    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to compute leadership analytics' },
      { status: 500 }
    );
  }
}
