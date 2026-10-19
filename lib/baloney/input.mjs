/** Normalize one public web URL without making a network request. */
export function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || /\s/.test(raw)) throw new Error('Paste one website or video link, without extra text.');
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
  let target;
  try { target = new URL(hasScheme ? raw : `https://${raw}`); }
  catch { throw new Error('That link is not valid. Try a URL such as example.com/article.'); }
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password)
    throw new Error('Use a public HTTP or HTTPS link without a username or password.');
  const host = target.hostname.toLowerCase();
  if (!host.includes('.') || host.endsWith('.') || host.endsWith('.localhost') || host.endsWith('.local') || host.includes(':') || /^\d+(\.\d+){3}$/.test(host))
    throw new Error('Use a public website address, not a local or IP address.');
  return target.href;
}
/** A bare URL pasted into the text field should be handled as a link. */
export function prepareSubmission(mode, text, url) {
  const source = String(text || '').trim();
  let selected = mode;
  let link = String(url || '').trim();
  if (selected === 'text' && /^(?:https?:\/\/|www\.)\S+$/i.test(source)) {
    selected = 'url'; link = source;
  }
  if (selected === 'url') return {mode:selected, text:'', url:normalizeUrl(link)};
  if (selected === 'text' && source.length < 20) throw new Error('Paste at least 20 characters, or use the Website / link tab.');
  if (source.length > 60000) throw new Error('Please keep the text under 60,000 characters.');
  return {mode:selected, text:source, url:''};
}
/** Safely handle HTML error pages and structured API errors. */
export async function readApiResponse(response) {
  let data;
  try { data = await response.json(); }
  catch { throw new Error('The server returned an unreadable response. Refresh the page and try again.'); }
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'The analysis service could not complete the request.');
  return data;
}
