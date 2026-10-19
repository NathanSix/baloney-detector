import { handleAnalyze } from '@/lib/baloney/analyze';
import { guard } from '@/lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;
export async function POST(req:Request){const denied=guard(req);if(denied)return denied;return handleAnalyze(req,{OPENAI_API_KEY:process.env.OPENAI_API_KEY,OPENAI_MODEL:process.env.OPENAI_MODEL});}
