import { NextRequest, NextResponse } from "next/server";
import type { TopicAnalysisRequest } from "@/lib/domain";
import { AnalysisError, analyzeTopic } from "@/lib/analyze";
import { createOpenAireProvider } from "@/lib/openaire";

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest): Promise<NextResponse> {
  let input: TopicAnalysisRequest;
  try {
    input = await parseRequest(request);
  } catch {
    return errorResponse(400, "INVALID_TOPIC", "Enter a research topic.");
  }

  try {
    const result = await analyzeTopic(input, {
      provider: createOpenAireProvider(),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AnalysisError) {
      if (err.code === "INVALID_TOPIC") {
        return errorResponse(400, err.code, err.message);
      }
      return errorResponse(502, err.code, err.message);
    }
    return errorResponse(503, "ANALYSIS_FAILED", "The analysis could not be completed.");
  }
}

async function parseRequest(request: NextRequest): Promise<TopicAnalysisRequest> {
  if (request.method === "GET") {
    const topic = request.nextUrl.searchParams.get("topic") ?? "";
    const baselineTopic = request.nextUrl.searchParams.get("baselineTopic");
    return {
      topic,
      ...(baselineTopic ? { baselineTopic } : {}),
    };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const topic = typeof body?.topic === "string" ? body.topic : "";
    const baselineTopic =
      typeof body?.baselineTopic === "string" ? body.baselineTopic : undefined;
    return {
      topic,
      ...(baselineTopic ? { baselineTopic } : {}),
    };
  }

  const form = await request.formData();
  const topic = form.get("topic");
  const baselineTopic = form.get("baselineTopic");
  return {
    topic: typeof topic === "string" ? topic : "",
    ...(typeof baselineTopic === "string" && baselineTopic
      ? { baselineTopic }
      : {}),
  };
}

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status },
  );
}
