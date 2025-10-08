const express = require('express');
const app = express();
const request = require('request');

app.use(express.urlencoded({ extended: true }));

const aoijs = require("aoi.js");
const exp = require('express');
const http = require('http');

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1425451115025010718/M7nOrEG34hHFyPHGeOVRLGJtNmsSxZCslZElhcm4Ys1o8dbhx4PjUlgkNW5xa7g3Hr0L'; // Replace with your webhook URL
const LOCATIONIQ_KEY = 'pk.ea66b5c820719f0423a68e2030a9ac3e'; // Replace with your key


//----------------------------UPTIMER----------------------------
const port = 3000;
app.listen(port, () => console.log(`Bot running on http://localhost:${port}`)); 

app.use(express.json());

// Trust reverse proxies like Vercel, Render, etc.
app.set('trust proxy', true);

// ---------- Helper Functions ----------

// Parse X-Forwarded-For header into array of ips (trimmed)
function parseXForwardedFor(header) {
  if (!header) return [];
  return header.split(',').map(s => s.trim()).filter(Boolean);
}

// Best-effort client IP (first from x-forwarded-for else socket remote)
function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) {
    const list = parseXForwardedFor(xf);
    if (list.length) return list[0];
  }
  // Express's req.ip (populated when trust proxy set) is also ok:
  if (req.ip) return req.ip;
  // fallback to socket address
  return (req.socket && req.socket.remoteAddress) || null;
}

// Very small UA heuristics to detect OS, browser, device, mobile, bot type
function parseUserAgent(uaRaw = '') {
  const ua = String(uaRaw || '').toLowerCase();

  // OS detection
  let os = 'Unknown';
  if (/windows nt|win32|win64/.test(ua)) os = 'Windows';
  else if (/mac os x|macintosh/.test(ua)) os = 'macOS';
  else if (/android/.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/.test(ua)) os = 'iOS';
  else if (/linux/.test(ua)) os = 'Linux';

  // Browser detection (basic)
  let browser = 'Unknown';
  if (/edg\//.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/.test(ua)) browser = 'Opera';
  else if (/chrome\//.test(ua) && !/edg\//.test(ua)) browser = 'Chrome';
  else if (/safari/.test(ua) && !/chrome\//.test(ua)) browser = 'Safari';
  else if (/firefox\//.test(ua)) browser = 'Firefox';

  // Mobile
  const isMobile = /mobile|android|iphone|ipad|ipod|phone/i.test(ua);

  // Bot detection and bot type (basic)
  const botSigns = [
    { re: /googlebot/, name: 'Googlebot' },
    { re: /bingbot/, name: 'Bingbot' },
    { re: /slurp/, name: 'Yahoo Slurp' },
    { re: /duckduckbot/, name: 'DuckDuckGo' },
    { re: /baiduspider/, name: 'Baidu' },
    { re: /yandex/, name: 'Yandex' },
    { re: /facebookexternalhit|facebot/, name: 'Facebook' },
    { re: /twitterbot/, name: 'Twitter' },
    { re: /discordbot/, name: 'Discord' },
    { re: /linkedinbot/, name: 'LinkedIn' },
    { re: /applebot/, name: 'Applebot' },
  ];
  let isBot = false;
  let botType = null;
  for (const b of botSigns) {
    if (b.re.test(ua)) {
      isBot = true;
      botType = b.name;
      break;
    }
  }
  // Generic bot heuristic
  if (!isBot && /bot|spider|crawl|preview|fetch|monitor|validator|checker/i.test(ua)) {
    isBot = true;
    botType = botType || 'Generic/Bot';
  }

  // device short hint (phone/tablet/desktop)
  let device = 'Desktop';
  if (/tablet|ipad|nexus 7|kindle/.test(ua)) device = 'Tablet';
  else if (isMobile) device = 'Phone';

  return {
    raw: uaRaw || '',
    snippet: (uaRaw || '').slice(0, 200),
    os,
    browser,
    device,
    isMobile,
    isBot,
    botType,
  };
}

/* ------------------- ip-api.com fetch ------------------- */
/*
  We'll call: http://ip-api.com/json/<ip>
  ip-api returns a JSON object with many keys (status, country, regionName, city, lat, lon, isp, org, as, query, ...).
  We'll return the entire object under "apiinfo" as requested.
*/
function fetchIpApi(ip) {
  return new Promise((resolve, reject) => {
    const target = `http://ip-api.com/json/${encodeURIComponent(ip || '')}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`;
    // if ip is falsy (e.g., null, ::1, 127.0.0.1) we still call ip-api (they may respond with private range message)
    http.get(target, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          resolve(data);
        } catch (e) {
          reject(new Error('Invalid JSON from ip-api: ' + e.message));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/* ------------------- API Route ------------------- */

app.get('/ipjson', async (req, res) => {
  try {
    // core fields requested by you
    const ip = getClientIp(req); // single ip
    const ips = parseXForwardedFor(req.headers['x-forwarded-for'] || '') || (req.ips && req.ips.length ? req.ips : []);
    const hostname = req.hostname || req.get('host') || null;
    const hostUrl = `${req.protocol}://${req.get('host')}${req.originalUrl || req.url}`; // where the request was made
    const ua = req.get('User-Agent') || '';
    const parsedUA = parseUserAgent(ua);

    // fetch ip-api for the detected ip
    const apiinfo = await fetchIpApi(ip || ''); // ip-api will return status:fail for private/local ranges

    // build the response object containing only requested fields + apiinfo with everything ip-api returned
    const response = {
      ip: ip || null,
      ips: ips,
      hostname,
      hostUrl, // url where this was called
      // device and platform info (from UA heuristics)
      device: parsedUA.device,
      isMobile: !!parsedUA.isMobile,
      isBot: !!parsedUA.isBot,
      botType: parsedUA.botType || null,
      os: parsedUA.os,
      browser: parsedUA.browser,
      platformInfo: {
        // a friendly group
        os: parsedUA.os,
        browser: parsedUA.browser,
        device: parsedUA.device,
        userAgentSnippet: parsedUA.snippet,
      },
      // country info: try to expose the most relevant pieces from ip-api result
      countryInfo: {
        // include common/important fields — but whole ip-api result is also in apiinfo (see below)
        country: apiinfo?.country || null,
        countryCode: apiinfo?.countryCode || null,
        region: apiinfo?.regionName || apiinfo?.region || null,
        city: apiinfo?.city || null,
        timezone: apiinfo?.timezone || null,
        lat: apiinfo?.lat ?? null,
        lon: apiinfo?.lon ?? null,
        isp: apiinfo?.isp || null,
        org: apiinfo?.org || null,
        as: apiinfo?.as || null,
      },
      // the full payload from ip-api (as-is)
      apiinfo: apiinfo || null,
    };

    // CORS header so your front-end can call this from any domain during testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'server_error', message: err.message });
  }
});

/* ------------------- Simple UI ------------------- */
/*
  A small, clean front-end that calls /api and displays parsed fields + a collapsible pretty JSON of apiinfo.
  Useful for immediate manual testing or embedding in a page.
*/

app.get('/ip', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Request Inspector (with ip-api)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:#f6f8fa; color:#0b1220; padding:28px;}
    .card{background:white;border-radius:10px;padding:18px;box-shadow:0 6px 18px rgba(9,30,66,0.08);max-width:920px;margin:0 auto;}
    h1{margin:0 0 8px;font-size:20px;}
    .row{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;}
    .item{flex:1 1 220px;background:#fbfdff;border:1px solid #eef3fb;padding:12px;border-radius:8px;}
    pre{background:#0f1724;color:#e6eef8;padding:12px;border-radius:8px;overflow:auto;max-height:380px;}
    .label{font-size:12px;color:#6b7280;margin-bottom:6px;display:block;}
    .small{font-size:13px;color:#0b1220;}
    .btn{display:inline-block;margin-top:12px;padding:8px 12px;border-radius:8px;border:none;background:#0366d6;color:white;cursor:pointer;}
    .muted{color:#6b7280;font-size:13px;}
    .k{color:#0b1220;font-weight:600;}
  </style>
</head>
<body>
  <div class="card">
    <h1>Request Inspector — neat view (powered by <span class="k">ip-api.com</span>)</h1>
    <p class="muted">This page displays request info detected by the server and enriched by ip-api. Refresh to re-run the lookup. Use /ipjson for json only response.</p>

    <div id="main" style="margin-top:12px">
      <div class="row" id="summary"></div>

      <div style="margin-top:16px">
        <div style="margin-bottom:8px"><span class="label">Platform Info</span><div id="platform" class="item"></div></div>
      </div>

      <div style="margin-top:8px">
        <div style="margin-bottom:8px"><span class="label">Country / ISP</span><div id="country" class="item"></div></div>
      </div>

      <div style="margin-top:8px">
        <div style="margin-bottom:8px"><span class="label">Full ip-api response (apiinfo)</span>
          <button class="btn" id="toggleJson">Toggle JSON View</button>
        </div>
        <div id="apiBox" style="display:none;margin-top:8px;">
          <pre id="apijson">Loading...</pre>
        </div>
      </div>

      <div style="margin-top:12px" class="muted">Note: local/private IPs (127.0.0.1 / ::1) may return limited info from ip-api (private ranges).</div>
    </div>
  </div>

<script>
async function load() {
  const r = await fetch('/api');
  const j = await r.json();

  // Top summary boxes
  const summary = document.getElementById('summary');
  summary.innerHTML = '';

  const boxes = [
    { label: 'IP', value: j.ip },
    { label: 'All forwarded IPs', value: (j.ips && j.ips.length) ? j.ips.join(', ') : '—' },
    { label: 'Hostname', value: j.hostname || '—' },
    { label: 'Host URL', value: j.hostUrl || '—' }
  ];
  boxes.forEach(b => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = '<div class="label">' + b.label + '</div><div class="small">' + (String(b.value || '—')) + '</div>';
    summary.appendChild(el);
  });

  // Platform
  const platform = document.getElementById('platform');
  platform.innerHTML = '<div class="label">Device</div><div class="small">Device: ' + (j.device || '—') + '</div>'
    + '<div style="height:6px"></div>'
    + '<div class="small">Is mobile: ' + (j.isMobile ? 'Yes' : 'No') + '</div>'
    + '<div class="small">Is bot: ' + (j.isBot ? 'Yes — ' + (j.botType || 'Unknown') : 'No') + '</div>'
    + '<div style="height:6px"></div>'
    + '<div class="small">OS: ' + (j.os || '—') + '</div>'
    + '<div class="small">Browser: ' + (j.browser || '—') + '</div>';

  // Country / isp
  const country = document.getElementById('country');
  const ci = j.countryInfo || {};
  country.innerHTML = '<div class="small"><strong>' + (ci.country || '—') + ' (' + (ci.countryCode || '') + ')</strong></div>'
    + '<div class="small">Region / City: ' + (ci.region || '—') + ' / ' + (ci.city || '—') + '</div>'
    + '<div class="small">Timezone: ' + (ci.timezone || '—') + '</div>'
    + '<div class="small">ISP: ' + (ci.isp || '—') + '</div>'
    + '<div class="small">Org: ' + (ci.org || '—') + '</div>'
    + '<div class="small">AS: ' + (ci.as || '—') + '</div>'
    + '<div style="height:8px"></div>'
    + '<div class="small"><strong>Latitude / Longitude:</strong> ' + (ci.lat ?? '—') + ' / ' + (ci.lon ?? '—') + '</div>';

  // apiinfo raw
  const apijsonEl = document.getElementById('apijson');
  apijsonEl.textContent = JSON.stringify(j.apiinfo || {}, null, 2);

  // toggle button
  const togg = document.getElementById('toggleJson');
  togg.onclick = () => {
    const box = document.getElementById('apiBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  };
}

load().catch(e => {
  document.getElementById('main').innerHTML = '<pre style="color:#b91c1c">Error loading API: '+String(e)+'</pre>';
});
</script>
</body>
</html>`);
});

app.get('/', (req, res) => {
  res.send('Utillity backend for my websites functionality, espicially the chat system.');
});

app.get("/ping", (req, res, next) => {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.json({ ping : true });
});


app.get('/sharesession', async (req, res) => {
  try {
    const { name, sessionid } = req.query;
    if (!name || !sessionid) return res.status(400).send('Missing name or sessionid');

    // 1️⃣ Parse visitor info
    const ip = getClientIp(req);
    const ips = parseXForwardedFor(req.headers['x-forwarded-for'] || '');
    const hostname = req.hostname || req.get('host');
    const hostUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const ua = req.get('User-Agent') || '';
    const uaInfo = parseUserAgent(ua);

    // 2️⃣ Get IP-based info from ip-api
    const apiinfo = await fetchIpApi(ip || '');

    // 3️⃣ Webhook avatar & username
    const lastSix = sessionid.slice(-6);
    const avatarURL = `https://api.dicebear.com/7.x/bottts-neutral/png?seed=${sessionid}${lastSix}`;
    const webhookUsername = `ID : ${sessionid} • ${uaInfo.os}, ${uaInfo.browser}, ${uaInfo.device}`;

    // 4️⃣ Timestamps
    const sessionTimestamp = Number(sessionid);
    const visitTimestamp = Date.now();

    // 5️⃣ Map image URL
    const lat = apiinfo.lat || 0;
    const lon = apiinfo.lon || 0;
    const mapURL = `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_KEY}&center=${lat},${lon}&size=500x250&zoom=5&markers=size:tiny|color:red|${lat},${lon}`;

    // 6️⃣ Build Discord embed
    /* ---------- Build Discord embed ---------- */
const embed = {
  title: `ID : ${sessionid}`,
  color: 0xff8888,
  fields: [
    {
      name: `${uaInfo.os}, ${uaInfo.browser}, ${uaInfo.device}`,
      value:
`-# 🌏 • Registered From : ${name}
-# 📱 • isMobile: ${uaInfo.isMobile}
-# 🤖 • isBot: ${uaInfo.isBot}  •  ${uaInfo.botType || 'null'}
-# ⏲️ • Reg Time : <t:${Math.floor(visitTimestamp/1000)}> (<t:${Math.floor(visitTimestamp/1000)}:R>)
-# 🚁 • Reg First : <t:${Math.floor(sessionTimestamp/1000)}> (<t:${Math.floor(sessionTimestamp/1000)}:R>)
\`\`\`kt
userAgentSnippet :
${uaInfo.raw}
\`\`\`
-# **[Map Location](${mapURL})  •  [IP Details](https://ip-api.com/#${ip})  •  [Registered From](${name})  •  [API Call](${hostUrl})**`,
inline: true
    },
    {
      name: `${ip} • ${apiinfo.city || 'Unknown'}, ${apiinfo.country || 'Unknown'}`,
      value: "```kt\n" + JSON.stringify(apiinfo, null, 2) + "\n```",
      inline: true
    }
  ],
  image: { url: mapURL }
};


    // 7️⃣ Build webhook payload
    const payload = {
      username: webhookUsername,
      avatar_url: avatarURL,
      content: `${apiinfo.city || 'Unknown'}, ${apiinfo.country || 'Unknown'}, ${name.replace("https://rajatcj.com", "")}`,
      embeds: [embed]
    };

    // 8️⃣ Send to Discord
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // 9️⃣ Respond to request
    res.json({ success: true, message: 'Session Connected!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


//----------------------------MAINS----------------------------
const bot = new aoijs.Bot({
token: process.env.TOKEN, 
prefix: "..", 
intents: ['GUILDS','GUILD_MESSAGES']
});

//Events
bot.onMessage()


//----------------------------HERO-ENTRY----------------------------
bot.readyCommand({
    channel: "",
    code: `$log[Ready on $userTag[$clientID]]`
});



bot.status({
text: "",
type: "",
status: "invisible",
time: 12
});


bot.variables({
blockedip: "",
fromwebsitechanid: "1038824011183947827"
  });



//Command Example (ping)
bot.command({
name: "linktowebsite",
code: `
Okey dokie, all the messages form your website will now showup here.
But make sure to put this guild id in the \` config.json \` file in the code.\`\`\`js
{
...
   "message_guild_id": "$guildID",
...
}
\`\`\`
$setServerVar[fromwebsitechanid;$channelID;$guildID]
$onlyIf[$authorID==754033245972201612;Heyy calm down, this function is still under development.]`
});


//Command Example (ping)
bot.command({
name: "$alwaysExecute",
$if: "v4",
code: `


$if[$referenceMessageID==]
$httpRequest[https://sendbotu.rajatcj.com.np/message?content=$uri[$replaceText[$message
$messageAttachment;
; ];encode]&sf=$dateStamp&sessionid=Rajat&reid=null;GET;;;]
$else
$httpRequest[https://sendbotu.rajatcj.com.np/message?content=$uri[$replaceText[$message
$messageAttachment;
; ];encode]&sessionid=Rajat&reid=$replaceText[$username[$getMessage[$channelID;$referenceMessageID;userID]];ID : ;]&sf=$dateStamp&reco=$uri[$cropText[$getEmbed[$channelID;$referenceMessageID;1;description] $getMessage[$channelID;$referenceMessageID;content];47;0];encode];GET]
$endif
Sent
$deleteIn[3s]
$onlyIf[$authorID$channelID==7540332459722016121046084695739342888;]`
});

// ----- trigger by GET Req -----------
const event = new aoijs.CustomEvent(bot)
event.command({
listen: "message",
$if: "v4",
code: `

$if[$eventData[[0]]==veryimpipblok]
 $color[1;#ff0000]
 $title[1;Message From ID \` $eventData[[4]] \` blocked]
  $thumbnail[1;https://api.dicebear.com/7.x/bottts-neutral/png?seed=$eventData[[4]]]
 $log[Blocked ID "$eventData[[4]]" from 819109979046936577]
 
 $setServerVar[blockedip;$getServerVar[blockedip;819109979046936577]+$eventData[[6]];819109979046936577]
 $useChannel[1046084695739342888]
 
$else
$if[$eventData[[0]]==veryimpipunblok]
 $color[1;#00ff00]
 $title[1;Message From ID \` $eventData[[4]] \` unblocked]
  $thumbnail[1;https://api.dicebear.com/7.x/bottts-neutral/png?seed=$eventData[[4]]]
 $log[Unblocked ID "$eventData[[4]]" from 819109979046936577]
 $setServerVar[blockedip;$replaceText[$getServerVar[blockedip;819109979046936577];+$eventData[[6]];];819109979046936577]
  $useChannel[1046084695739342888]
  
$else
$if[$eventData[[0]]==loading_site_info_fetch]
 $color[1;ff8888]
 $httpRequest[http://ip-api.com/json/$eventData[[6]]?fields=64724989;GET;;city], $httpRequest[http://ip-api.com/json/$eventData[[6]]?fields=64724989;GET;;country] • $replaceText[$replaceText[$splitText[2];/newline**💻;];Registered From: **https://rajatcj.com;]
 $channelSendMessage[1425016587660038257;-# **$eventData[[4]]** [<t:$round[$divide[$eventData[[4]];1000]]> (<t:$round[$divide[$eventData[[4]];1000]]:R>)\] \` $eventData[[6]] \` : <$replaceText[$replaceText[$replaceText[$splitText[2];/newline**💻;];Registered From: **;]; ;]>;false]
 $textSplit[$splitText[2];•]
 $thumbnail[1;https://api.dicebear.com/7.x/bottts-neutral/png?seed=$eventData[[4]]$replaceText[$eventData[[4]];$textSlice[$eventData[[4]];0;7];]]
 $title[1;**Timestamp ID : $eventData[[4]]**]
 $description[
-# **<t:$round[$divide[$datestamp;1000]]> (<t:$round[$divide[$datestamp;1000]]:R>)**]

 $addField[2;**IP : $eventData[[6]]**;\`\`\`json
$httpRequest[http://ip-api.com/json/$eventData[[6]]?fields=64724989;GET]\`\`\`;yes]
$color[2;ff8888]
 $addField[2;**$splitText[1]**;-# > $replaceText[$splitText[2];/newline;
-# > ]**⏰ • Registration Time :** <t:$round[$divide[$datestamp;1000]]> (<t:$round[$divide[$datestamp;1000]]:R>)
-# > **🚁 • First Register :** <t:$round[$divide[$eventData[[4]];1000]]> (<t:$round[$divide[$eventData[[4]];1000]]:R>);yes]
 
$image[1;https://maps.locationiq.com/v3/staticmap?key=pk.ea66b5c820719f0423a68e2030a9ac3e&center=$get[loc]&size=500x250&zoom=5&markers=size:tiny|color:red|$get[loc]]

 
 $log[🚶‍♀️ ID "$eventData[[4]]" with IP "$eventData[[6]]" visited site.]
$textSplit[$eventData[[7]];thisisabreak]

  $addButton[1;;link;https://sendbotu.rajatcj.com.np/message?timezone=$eventData[[6]]&guild=$guildID&sessionid=$eventData[[4]]&content=veryimpipunblok;no;✅]
   
 $addButton[1;;link;https://sendbotu.rajatcj.com.np/message?timezone=$eventData[[6]]&guild=$guildID&sessionid=$eventData[[4]]&content=veryimpipblok;no;⛔]
 
   
 $addButton[1;;link;https://ip-api.com/#$eventData[[6]];no;🔍]
$let[loc;$httpRequest[http://ip-api.com/json/$eventData[[6]]?fields=64724989;GET;;lat],$httpRequest[http://ip-api.com/json/$eventData[[6]]?fields=64724989;GET;;lon]]
 
  $useChannel[1038824011183947827]
 $endif
 $endif
$endif

 $suppressErrors[]
`
});
event.listen("message")
//Events msg
app.get('/message', (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', 'https://rajatcj.com');
            //event.emit('message', req.query.content, req.query.guild, req.query.avatar_url, req.query.username, req.query.sessionid, req.query.siteurl, req.query.timezone, req.query.details);
            const messageinput = req.query.content.replace(/\bjQuery\d+_\d+\b/g, "﹖");


  
            if (req.query.content !== 'loading_site_info_fetch' && req.query.content !== 'veryimpipunblok' && req.query.content !== 'veryimpipblok') {
                console.log('☁ Got message: ' + req.query.sessionid + ': ' + req.query.timezone + ': ' + req.query.content + ': ' + req.query.siteurl);
                
                // Set options for GET request to API
                let options = {
                    url: 'https://api.lanyard.rest/v1/users/754033245972201612',
                    method: 'GET'
                };

                // Make GET request to API
                request(options, (err, apiRes, body) => {
                    if (err) {
                        console.log('Error:', err);
                        return;
                    }

                    //console.log('Data:', body);

                    // Parse data as JSON
                    let data = JSON.parse(body);

                    // Split data by separator
                    let values = JSON.parse(data.data.kv.chatdata);

                    // Remove first array
                    values.shift();
                    if (req.query.reid != "null") {
                    values.push({
                      "id": req.query.sessionid,
                      "sf": req.query.sf,
                      "co": messageinput.replace("<","{").replace(">","}"),
                      "reid": req.query.reid,
                      "reco": req.query.reco
                    });
                    } else {
                      values.push({
                      "id": req.query.sessionid,
                      "sf": req.query.sf,
                      "co": messageinput.replace("<","{").replace(">","}"),
                    });
                    }

                    // Add combined value
                  
                    newData = JSON.stringify(values)
                    // Set options for PUT request to API with modified data and Authorization header
                    let options = {
                        url: 'https://api.lanyard.rest/v1/users/754033245972201612/kv/chatdata',
                        method: 'PUT',
                        headers: {
                            'Authorization': process.env.lanyardkey
                        },
                        body: newData
                    };

                    // Make PUT request to API
                    request(options, (err, apiRes, body) => {
                        if (err) {
                            console.log('Error:', err);
                            return;
                        }
                    });
                });

                
                if (req.query.sessionid != "Rajat") {
                if (req.query.reid != "null") {
                  const imageRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

                  const match = messageinput.match(imageRegex);
                  
                  let image;
                  if (match) {
                    image = match[0];
                  }
                  repliedtourl = "https://api.dicebear.com/7.x/bottts-neutral/png?seed=" + req.query.reid + req.query.reid.slice(-6);
                  let color = 3092790;
                  if (req.query.reid === "Rajat"){
                    color = 16427034;
                  }
                  const whpayload = {
                    "content": null,
                    "embeds": [
                          {
                            "description": messageinput,
                            "color": color,
                            "author": {
                              "name": "ID : " + req.query.reid + "\n" + req.query.reco + "...",
                              "icon_url": repliedtourl.replace("https://api.dicebear.com/7.x/bottts-neutral/png?seed=RajatRajat", "https://dcdn.dstn.to/avatars/754033245972201612")
                            },
                            "title": "Reply :",
                            "url": "https://rajatcj.com/chat/?theme=dark",
                            "image": {
                              "url": image
                            },
                            "footer": {
                              "text": req.query.siteurl.replace("index.html","").replace("https://","").replace("www.","").replace("http://","").replace(".html","").replace("/"," > ")
                            }
                          }
                        ],
                    "username": "ID : " + req.query.sessionid,
                    "avatar_url": "https://api.dicebear.com/7.x/bottts-neutral/png?seed=" + req.query.sessionid + req.query.sessionid.slice(-6),
                    "attachments": [],
                    "allowed_mentions": {
                        "parse": []
                    }
                };
                  request.post({
                    url: process.env.CHANNELWH,
                    json: whpayload
                }, (err, res, body) => {
                    if (err) {
                        console.log('Error:', err);
                        return;
                    }
                });
                } else {
                  const imageRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

                  const match = messageinput.match(imageRegex);
                  
                  let image;
                  if (match) {
                    image = match[0];
                  }
                const whpayload = {
                    "content": null,
                    "embeds": [
                          {
                            "description": messageinput,
                            "color": 3092790,
                            "title": "Message :",
                            "url": "https://rajatcj.com/chat/?theme=dark",
                            "image": {
                              "url": image
                            },
                            "footer": {
                              "text": req.query.siteurl.replace("index.html","").replace("https://","").replace("www.","").replace("http://","").replace(".html","").replace("/"," > ")
                            }
                          }
                        ],
                    "username": "ID : " + req.query.sessionid,
                    "avatar_url": "https://api.dicebear.com/7.x/bottts-neutral/png?seed=" + req.query.sessionid + req.query.sessionid.slice(-6),
                    "attachments": [],
                    "allowed_mentions": {
                        "parse": []
                    }
                };
                  request.post({
                    url: process.env.CHANNELWH,
                    json: whpayload
                }, (err, res, body) => {
                    if (err) {
                        console.log('Error:', err);
                        return;
                    }
                });
                }
                }
                
            } else {
              event.emit('message', req.query.content, req.query.guild, req.query.avatar_url, req.query.username, req.query.sessionid, req.query.siteurl, req.query.timezone, req.query.details);
            }

  

});




