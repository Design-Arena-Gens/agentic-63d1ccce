const REALTIME_ENDPOINT = "https://data.mef.gov.kh/api/v1/realtime-api/uv";

export type RealtimeResponse = {
  status: string;
  data: Array<{
    id: number;
    location: string;
    uv_index: number;
    reading_time: string;
  }>;
};

export async function fetchRealtimeData(): Promise<RealtimeResponse> {
  const response = await fetch(REALTIME_ENDPOINT, {
    method: "GET",
    headers: {
      accept: "application/json"
    },
    next: {
      revalidate: 60
    }
  });

  if (!response.ok) {
    throw new Error(`Realtime API error: ${response.statusText}`);
  }

  return response.json();
}
