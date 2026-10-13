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

  const key = process.env.WEATHER_API_KEY;
  if (!key) return res.status(503).json({ error: 'Weather is unavailable' });

  const lang = req.query?.lang === 'vi' ? 'vi' : 'en';
  const url = new URL('https://api.weatherapi.com/v1/forecast.json');
  url.searchParams.set('key', key);
  url.searchParams.set('q', `${location.latitude},${location.longitude}`);
  url.searchParams.set('days', '3');
  url.searchParams.set('lang', lang);
  url.searchParams.set('aqi', 'no');
  url.searchParams.set('alerts', 'no');

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`WeatherAPI returned ${response.status}`);
    const data = await response.json();
    const forecast = data.forecast?.forecastday;
    if (!Array.isArray(forecast) || forecast.length === 0) throw new Error('Missing forecast');
    const days = forecast.slice(0, 3).map(({ date, day }) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !day || !Number.isFinite(day.maxtemp_c) ||
          !Number.isFinite(day.mintemp_c) || typeof day.condition?.text !== 'string') throw new Error('Invalid forecast');
      const chance = Number(day.daily_chance_of_rain);
      return {
        date,
        condition: day.condition.text.slice(0, 150),
        conditionCode: Number.isInteger(day.condition.code) ? day.condition.code : null,
        maxC: Math.round(day.maxtemp_c),
        minC: Math.round(day.mintemp_c),
        rainChance: Number.isFinite(chance) ? Math.min(100, Math.max(0, chance)) : null
      };
    });
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({ days });
  } catch {
    // Do not log a URL or provider response containing the private API key.
    console.error('Weather forecast failed');
    return res.status(502).json({ error: 'Weather is unavailable' });
  }
};
