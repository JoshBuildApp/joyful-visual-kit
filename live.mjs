import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--hide-scrollbars'] })
const errors = []
for (const [w, h, url, name] of [[1440, 900, 'https://guyavnaim.com/archive', 'live-desk'], [390, 844, 'https://guyavnaim.com/he/archive', 'live-phone']]) {
  const p = await b.newPage()
  p.on('pageerror', (e) => errors.push(name + ': ' + String(e.message || e).slice(0, 140)))
  p.on('response', (r) => { if (r.status() >= 400 && r.url().includes('guyavnaim.com')) errors.push(name + ' ' + r.status() + ' ' + r.url().slice(0, 90)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 2500))
  const info = await p.evaluate(async () => {
    const shots = []
    for (const id of ['sites', 'agents', 'systems', 'images']) { document.getElementById(id).scrollIntoView(); await new Promise((r) => setTimeout(r, 900)) }
    await new Promise((r) => setTimeout(r, 1500))
    const imgs = [...document.querySelectorAll('.sheet img')].slice(0, 12)
    return { tiles: document.querySelectorAll('.sheet [data-key]').length, broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length, doors: [...document.querySelectorAll('.door b')].map((b) => b.innerText).join(' '), overflow: document.documentElement.scrollWidth > innerWidth }
  })
  await p.evaluate(() => scrollTo(0, 0))
  await new Promise((r) => setTimeout(r, 1500))
  await p.screenshot({ path: `${name}.jpg`, type: 'jpeg', quality: 70 })
  console.log(name, JSON.stringify(info))
}
console.log('errors', JSON.stringify(errors.slice(0, 8)))
await b.close()
