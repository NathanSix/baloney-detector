import { guard } from '@/lib/access';
export const dynamic = 'force-dynamic';
export async function GET(req:Request){const denied=guard(req);if(denied)return denied;return Response.json({ready:Boolean(process.env.OPENAI_API_KEY)},{headers:{'Cache-Control':'no-store'}});}
