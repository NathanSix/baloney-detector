import { timingSafeEqual, createHash } from 'node:crypto';
function equal(a:string,b:string){return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());}
export function guard(request:Request){
 const password=process.env.APP_PASSWORD;
 if(!password){
  if(process.env.NODE_ENV==='production'&&process.env.OPENAI_API_KEY)return Response.json({error:'Set APP_PASSWORD on the server before enabling live analysis in production.'},{status:503,headers:{'Cache-Control':'no-store'}});
  return null;
 }
 let entered='';try{const auth=request.headers.get('authorization')||'';if(auth.startsWith('Basic ')){const decoded=Buffer.from(auth.slice(6),'base64').toString();const separator=decoded.indexOf(':');if(separator>=0)entered=decoded.slice(separator+1);}}catch{}
 if(equal(entered,password))return null;
 return new Response('Sign in to use your Baloney Detector. The username can be anything; use the configured app password.',{status:401,headers:{'WWW-Authenticate':'Basic realm="Baloney Detector", charset="UTF-8"','Cache-Control':'no-store'}});
}
