const catalog = require('../catalog');

const validCoordinates = location => location &&
  Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
  Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const roomId = typeof req.query?.roomId === 'string' ? req.query.roomId : '';
  const room = catalog.rooms.find(item => item.id === roomId);
  const property = room && catalog.properties.find(item => item.id === room.propertyId);
  if (!room || !property) return res.status(404).json({ error: 'Room not found' });
  const location = room.location || property;
  if (!validCoordinates(location)) return res.status(503).json({ error: 'Weather is unavailable' });

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return res.status(503).json({ error: 'Weather is unavailable' });

  const lang = req.query?.lang === 'vi' ? 'vi' : 'en';
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
  url.searchParams.set('appid', key);
  url.searchParams.set('lat', String(location.latitude));
  url.searchParams.set('lon', String(location.longitude));
  url.searchParams.set('units', 'metric');
  url.searchParams.set('lang', lang);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('OpenWeather forecast unavailable');
    const data = await response.json();
    if (!Array.isArray(data.list) || !data.list.length || !Number.isFinite(data.city?.timezone) ||
        Math.abs(data.city.timezone) > 86400) throw new Error('Missing forecast');
    const groups = new Map();
    for (const period of data.list) {
      if (!Number.isFinite(period.dt) || !Number.isFinite(period.main?.temp) ||
          typeof period.weather?.[0]?.description !== 'string') throw new Error('Invalid forecast');
      if (period.dt * 1000 < Date.now()) continue;
      // OpenWeather timestamps are UTC; group by the destination's local date.
      const local = new Date((period.dt + data.city.timezone) * 1000);
      const date = local.toISOString().slice(0, 10);
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date).push({ ...period, hour: local.getUTCHours() });
    }
    const days = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 3).map(([date, periods]) => {
      const representative = periods.reduce((best, item) => Math.abs(item.hour - 12) < Math.abs(best.hour - 12) ? item : best);
      const temperatures = periods.map(item => item.main.temp);
      const chances = periods.map(item => item.pop).filter(value => Number.isFinite(value) && value >= 0 && value <= 1);
      return {
        date,
        condition: representative.weather[0].description.slice(0, 150),
        conditionCode: Number.isInteger(representative.weather[0].id) ? representative.weather[0].id : null,
        maxC: Math.round(Math.max(...temperatures)),
        minC: Math.round(Math.min(...temperatures)),
        rainChance: chances.length ? Math.round(Math.max(...chances) * 100) : null
      };
    });
    if (!days.length) throw new Error('Missing upcoming forecast');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({ days });
  } catch {
    // Do not log a URL or provider response containing the private API key.
    console.error('Weather forecast failed');
    return res.status(502).json({ error: 'Weather is unavailable' });
  }
};
