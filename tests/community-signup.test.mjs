import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COMMUNITY_SIGNUP_ENDPOINT, isValidSignupEmail, sendCommunitySignup, SignupError } from '../scripts/features/community-signup-request.js';
import { initCommunitySignup } from '../scripts/features/community-signup.js';

const response = (body, status = 200, type = 'application/json') => ({ok: status >= 200 && status < 300, status, headers: new Headers({'content-type': type}), json: async () => body});

test('validates addresses before any network request', async () => {
  for (const address of ['', 'invalid', 'a@b', 'a@@b.com', 'a b@c.com', '<script>@b.com', 'a\n@b.com', 'a'.repeat(255) + '@b.com']) {
    assert.equal(isValidSignupEmail(address), false, address);
    await assert.rejects(sendCommunitySignup(address, {fetchImpl: () => assert.fail('must not send')}), {code: 'invalid'});
  }
  assert.equal(isValidSignupEmail('person+events@example.com'), true);
});

test('pins HTTPS destination and sends only Brevo fields without cookies or redirects', async () => {
  assert.equal(await sendCommunitySignup('person@example.com', {fetchImpl: async (url, options) => {
    assert.equal(url, `${COMMUNITY_SIGNUP_ENDPOINT}?isAjax=1`);
    assert.equal(new URL(url).protocol, 'https:');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.mode, 'cors');
    assert.deepEqual([...options.body], [['EMAIL', 'person@example.com'], ['locale', 'en'], ['email_address_check', '']]);
    return response({success: true, redirect:'https://evil.example', successPage:'<script>alert(1)</script>'});
  }}), true);
});

test('only accepts explicit boolean success from an HTTP-success JSON response', async () => {
  for (const body of [null, {}, {success:false}, {success:'true'}, {success:1}, {message:'success'}]) {
    await assert.rejects(sendCommunitySignup('a@example.com', {fetchImpl: async () => response(body)}), {code:'rejected'});
  }
  await assert.rejects(sendCommunitySignup('a@example.com', {fetchImpl: async () => response({success:true}, 500)}), {code:'server'});
  await assert.rejects(sendCommunitySignup('a@example.com', {fetchImpl: async () => response({success:true}, 429)}), {code:'rate-limit'});
  await assert.rejects(sendCommunitySignup('a@example.com', {fetchImpl: async () => response({success:true}, 200, 'text/html')}), {code:'unexpected'});
  await assert.rejects(sendCommunitySignup('a@example.com', {fetchImpl: async () => ({...response({}), json: async () => {throw new SyntaxError();}})}));
});

test('network failure and timeout never become success and do not retry', async () => {
  let calls = 0;
  await assert.rejects(sendCommunitySignup('a@example.com', {fetchImpl: async () => { calls++; throw new TypeError(); }}), {code:'network'});
  assert.equal(calls, 1);
  await assert.rejects(sendCommunitySignup('a@example.com', {timeoutMs: 5, fetchImpl: (_, {signal}) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('abort'))))}), {code:'timeout'});
});

const fixture = (sendSignup) => {
  const handlers = {};
  const inputHandlers = {};
  const dialogHandlers = {};
  const label = {textContent: 'join the community →'};
  const button = {disabled:false, querySelector:()=>label, focus(){ this.focused=true; }};
  const email = {value:'person@example.com', readOnly:false, validity:'', setCustomValidity(v){this.validity=v;},addEventListener:(k,v)=>inputHandlers[k]=v};
  const trap = {value:''};
  const status = {textContent:''};
  const dialog = {open:false, addEventListener:(k,v)=>dialogHandlers[k]=v,showModal(){this.open=true;}};
  const form = {querySelector:s=>s.startsWith('input')?email:button, elements:{namedItem:()=>trap}, reportValidity:()=>!email.validity, addEventListener:(k,v)=>handlers[k]=v,setAttribute(){},removeAttribute(){},reset(){email.value='';}};
  globalThis.document = {querySelector:()=>form, querySelectorAll:()=>[], getElementById:id=>id==='signup-confirmation'?dialog:status};
  initCommunitySignup({sendSignup});
  return {email, trap, status, button, dialog, dialogHandlers, submit:()=>handlers.submit({preventDefault(){}})};
};

test('blocks overlapping submissions; success resets form and opens dialog', async () => {
  let resolve, calls=0;
  const ui=fixture(()=>{calls++;return new Promise(r=>resolve=r);});
  const pending=ui.submit();
  assert.equal(ui.button.disabled,true); assert.equal(ui.email.readOnly,true);
  await ui.submit(); assert.equal(calls,1); assert.equal(ui.dialog.open,false);
  resolve(true); await pending;
  assert.equal(ui.dialog.open,true); assert.equal(ui.email.value,''); assert.equal(ui.button.disabled,false);
  ui.dialogHandlers.close(); assert.equal(ui.button.focused,true);
});

test('error preserves address, releases controls, blocks rapid retry, and never displays response HTML', async () => {
  let calls=0;
  const ui=fixture(async()=>{calls++;throw new SignupError('rate-limit');});
  await ui.submit(); assert.equal(ui.dialog.open,false); assert.equal(ui.email.value,'person@example.com'); assert.equal(ui.button.disabled,false);
  assert.match(ui.status.textContent,/wait a minute/);
  await ui.submit(); assert.equal(calls,1);
  const hostile=fixture(async()=>{throw {code:'<img src=x onerror=alert(1)>'};});
  await hostile.submit(); assert.equal(hostile.status.textContent.includes('<'),false);
});

test('invalid email and filled honeypot cannot send; false success cannot open popup', async () => {
  const ui=fixture(()=>assert.fail('must not send'));
  ui.email.value='invalid'; await ui.submit(); assert.equal(ui.dialog.open,false);
  ui.email.value='person@example.com'; ui.trap.value='bot'; await ui.submit(); assert.equal(ui.dialog.open,false);
  const rejected=fixture(async()=>false); await rejected.submit(); assert.equal(rejected.dialog.open,false);
});

test('HTML fallback and restrictive page policy match the request endpoint', () => {
  const html=readFileSync(new URL('../events.html',import.meta.url),'utf8');
  assert.ok(html.includes(`method="post" action="${COMMUNITY_SIGNUP_ENDPOINT}"`));
  assert.ok(html.includes('connect-src https://21c6bf62.sibforms.com;'));
  assert.ok(html.includes("script-src 'self';"));
  assert.ok(html.includes('id="signup-confirmation" aria-labelledby='));
});
