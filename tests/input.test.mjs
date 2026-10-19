import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeUrl, prepareSubmission, readApiResponse} from '../lib/baloney/input.mjs';
test('accepts public links with or without a scheme',()=>{
 assert.equal(normalizeUrl(' example.com/article?q=test#section '),'https://example.com/article?q=test#section');
 assert.equal(normalizeUrl('https://youtu.be/abc123'),'https://youtu.be/abc123');
 assert.equal(normalizeUrl('www.example.com'),'https://www.example.com/');
});
test('rejects dangerous, malformed, local and credential-bearing links',()=>{
 for(const value of ['', 'not a link', 'javascript:alert(1)', 'file:///etc/passwd', 'https://user:pass@example.com', 'http://localhost', 'http://127.0.0.1','http://[::1]','https://host.local']) assert.throws(()=>normalizeUrl(value), undefined, value);
});
test('a URL pasted into the text box becomes a link submission',()=>{
 assert.deepEqual(prepareSubmission('text','https://example.com/a',''),{mode:'url',text:'',url:'https://example.com/a'});
 assert.equal(prepareSubmission('text','The article at https://example.com makes a claim.','').mode,'text');
});
test('normalizes URL-mode submissions and rejects short text',()=>{
 assert.equal(prepareSubmission('url','','example.com').url,'https://example.com/');
 assert.throws(()=>prepareSubmission('text','short',''));
});
test('missing API configuration returns its explanation, not a JSON parse failure',async()=>{
 await assert.rejects(readApiResponse(new Response(JSON.stringify({error:'Live analysis needs a server API key.'}),{status:503})),/server API key/);
 await assert.rejects(readApiResponse(new Response('<html>error</html>',{status:502})),/unreadable response/);
});
