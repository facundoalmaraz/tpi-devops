import { NextResponse } from "next/server"

export async function GET() {
  try {
    //const prometheusUrl = "http://localhost:9090/api/v1/query"
    const prometheusUrl = "http://prometheus:9090/api/v1/query"


    const queries = {
      requests: 'api_requests_total',
      memory: 'process_resident_memory_bytes',
      uptime: 'process_start_time_seconds',
    }

    const fetchMetric = async (query: string) => {
      const res = await fetch(`${prometheusUrl}?query=${encodeURIComponent(query)}`)
      const json = await res.json()
      return json.data.result[0]?.value?.[1] ?? "0"
    }

    const [requests, memory, uptime] = await Promise.all([
      fetchMetric(queries.requests),
      fetchMetric(queries.memory),
      fetchMetric(queries.uptime),
    ])

    return NextResponse.json({ requests, memory, uptime })
  } catch (e) {
    return NextResponse.json({ error: "Error fetching metrics" }, { status: 500 })
  }
}
