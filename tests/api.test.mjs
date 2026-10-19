import test from 'node:test';
import assert from 'node:assert/strict';
import {handleAnalyze} from '../lib/baloney/analyze.ts';
function request(fields, origin='https://detector.example') {const body=new FormData();for(const [k,v] of Object.entries(fields))body.set(k,v);return new Request('https://detector.example/api/analyze',{method:'POST',headers:{origin},body});}
test('URL input is accepted with a clear configuration error when no API key exists',async()=>{
 const response=await handleAnalyze(request({mode:'url',url:'example.com/article'}),{});
 assert.equal(response.status,503);assert.match((await response.json()).error,/input was accepted/);
});
test('URL validation runs before connection checks',async()=>{
 const response=await handleAnalyze(request({mode:'url',url:'not a link'}),{});
 assert.equal(response.status,400);assert.match((await response.json()).error,/one website/);
});
test('rejects cross-origin analysis requests',async()=>{
 const response=await handleAnalyze(request({mode:'url',url:'example.com'},'https://other.example'),{});
 assert.equal(response.status,403);
});
test('a submitted URL reaches the provider normalized, with web retrieval required',async()=>{
 const original=globalThis.fetch;let sent;
 globalThis.fetch=async (_url,options)=>{sent=JSON.parse(options.body);return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({title:'Test fixture',summary:'Mocked transport response, not real analysis.',coverage:'Test only',mainClaim:'Example',strengths:[],limitations:[],findings:[],questions:[]})}]}]});};
 try{const response=await handleAnalyze(request({mode:'url',url:'example.com/article'}),{OPENAI_API_KEY:'test-only-not-a-real-key'});assert.equal(response.status,200);assert.equal(sent.tool_choice,'required');assert.equal(sent.tools[0].type,'web_search');assert.match(sent.input[0].content[0].text,/https:\/\/example.com\/article/);}finally{globalThis.fetch=original;}
});
test('provider errors stay errors rather than becoming fabricated reports',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('{}',{status:429});
 try{const response=await handleAnalyze(request({mode:'url',url:'example.com'}),{OPENAI_API_KEY:'test-only-not-a-real-key'});assert.equal(response.status,502);assert.match((await response.json()).error,/usage or rate limit/);}finally{globalThis.fetch=original;}
});
