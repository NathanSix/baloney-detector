import { Buffer } from 'node:buffer';
import { prepareSubmission, normalizeUrl } from './input.mjs';
import { instructions,reportSchema } from './schema.ts';
const headers={'Cache-Control':'private, no-store'};
const error=(message:string,status=400)=>Response.json({error:message},{status,headers});
type ProviderResult={status?:string; output?:{type:string;content?:{type:string;text?:string;annotations?:{type:string;url?:string;title?:string}[]}[];action?:{sources?:{url:string;title?:string}[]}}[];segments?:{start:number;text:string}[];text?:string};
async function provider(path:string,key:string,body:BodyInit,json=true):Promise<ProviderResult>{
 const res=await fetch('https://api.openai.com/v1/'+path,{method:'POST',headers:{Authorization:`Bearer ${key}`,...(json?{'Content-Type':'application/json'}:{})},body,signal:AbortSignal.timeout(150000)});
 if(!res.ok){if(res.status===429)throw new Error('The analysis service is at its usage or rate limit. Please try again later.');if(res.status===401)throw new Error('The analysis connection needs attention. Please reconnect the service.');throw new Error(`The analysis provider could not process this request (${res.status}). Try a shorter excerpt or a supported file.`);}
 return await res.json() as ProviderResult;
}
export async function handleAnalyze(req:Request, config: {OPENAI_API_KEY?:string;OPENAI_MODEL?:string}){
 if(req.headers.get('origin')!==new URL(req.url).origin)return error('This request must come from this site.',403);
 const key=config.OPENAI_API_KEY;
 
 if(Number(req.headers.get('content-length')||0)>27*1024*1024)return error('Please upload a file smaller than 20 MB.',413);
 try{
 const form=await req.formData();let prepared;try{prepared=prepareSubmission(String(form.get('mode')||'text'),String(form.get('text')||''),String(form.get('url')||''));}catch(e){return error(e instanceof Error?e.message:'Check your source.');}const {mode,text,url}=prepared;const check=form.get('verify')==='true';const file=form.get('file');
 if(!['text','url','file','video'].includes(mode))return error('Choose a supported input type.');
 if(text.length>60000)return error('Please keep the text under 60,000 characters.');
 if(!key)return error('Your input was accepted, but live analysis needs a server API key. No analysis has run. You can use the example or copy the request into ChatGPT while the connection is configured.',503);
 const content:Record<string,unknown>[]=[];let transcript='';
 if(mode==='url') {const target=normalizeUrl(url);content.push({type:'input_text',text:'Analyze the actual content at this URL. If a video, require an accessible transcript. URL: '+target});}
 else if(mode==='text'){if(text.length<20)return error('Add at least 20 characters of source text.');content.push({type:'input_text',text:'SOURCE TEXT:\n'+text});}
 else {
 if(!(file instanceof File)||!file.size)return error('Choose a file first.');if(file.size>20*1024*1024)return error('Please upload a file smaller than 20 MB.',413);
 const ext=file.name.split('.').pop()?.toLowerCase()||'';
 if(mode==='video'){
 if(!['mp4','webm','mp3','m4a','wav','mpeg','mpga'].includes(ext))return error('Use MP4, WebM, MP3, M4A, WAV or MPEG, up to 20 MB. For other formats, upload a transcript under File.');
 const data=new FormData();data.append('file',file);data.append('model','whisper-1');data.append('response_format','verbose_json');data.append('timestamp_granularities[]','segment');
 const result=await provider('audio/transcriptions',key,data,false);
 transcript=Array.isArray(result.segments)?result.segments.map((s:{start:number,text:string})=>`[${Math.floor(s.start/60)}:${String(Math.floor(s.start%60)).padStart(2,'0')}] ${s.text}`).join('\n'):String(result.text||'');
 if(transcript.trim().length<20)return error('Not enough speech could be transcribed. Try a clearer recording or upload its transcript.');if(transcript.length>60000)return error('This recording is too long for one report. Split it into shorter clips.');
 content.push({type:'input_text',text:'SPEECH-ONLY TRANSCRIPT (visuals not reviewed; transcription may contain errors):\n'+transcript});
 }else{
 if(!['pdf','docx','txt','md','srt','vtt','png','jpg','jpeg','webp'].includes(ext))return error('Use PDF, DOCX, TXT, MD, SRT, VTT, PNG, JPG or WebP.');
 if(['txt','md','srt','vtt'].includes(ext)){const source=await file.text();if(source.length>60000)return error('This file is too long. Upload a shorter excerpt under 60,000 characters.');content.push({type:'input_text',text:'SOURCE FILE '+file.name+':\n'+source});}
 else {const mime=({pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'} as Record<string,string>)[ext];const data=`data:${mime};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;content.push(['png','jpg','jpeg','webp'].includes(ext)?{type:'input_image',image_url:data}:{type:'input_file',filename:file.name,file_data:data});}
 }
 if(text)content.push({type:'input_text',text:'Context supplied by user (not independent evidence): '+text});
 }
 const useWeb=check||mode==='url';
 const result=await provider('responses',key,JSON.stringify({model:config.OPENAI_MODEL||'gpt-5.5',store:false,instructions:instructions+'\nExternal verification: '+(useWeb?'enabled':'NOT enabled; do not claim facts were verified.'),input:[{role:'user',content}],...(useWeb?{tools:[{type:'web_search'}],...(mode==='url'?{tool_choice:'required'}:{}),include:['web_search_call.action.sources']}:{ }),text:{format:{type:'json_object'}},max_output_tokens:6500}));
 if(result.status!=='completed')return error('The analysis did not finish. Try a shorter source.',502);
 const output=(result.output||[]) as {type:string;content?:{type:string;text?:string;annotations?:{type:string;url?:string;title?:string}[]}[];action?:{sources?:{url:string;title?:string}[]}}[];
 const raw=output.flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text||'').join('');
 let parsed;try{parsed=reportSchema.parse(JSON.parse(raw));}catch{return error('The service returned an incomplete report. Please try again.',502);}
 const sources=new Map<string,{url:string,title:string}>();for(const item of output){for(const source of item.action?.sources||[]){if(/^https?:\/\//i.test(source.url))sources.set(source.url,{url:source.url,title:source.title||new URL(source.url).hostname});}for(const c of item.content||[])for(const a of c.annotations||[])if(a.type==='url_citation'&&a.url&&/^https?:\/\//i.test(a.url))sources.set(a.url,{url:a.url,title:a.title||a.url});}
 return Response.json({...parsed,sources:[...sources.values()].slice(0,20),...(transcript?{transcript}:{})},{headers});
 }catch(e){return error(e instanceof Error&&e.name==='TimeoutError'?'The analysis took too long. Try a shorter source.':e instanceof Error?e.message:'Analysis failed. Please try again.',502);}
}
