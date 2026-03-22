'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import {
  WbSunnyOutlined, CloudOutlined, GrainOutlined, AcUnitOutlined,
  AirOutlined, NightsStayOutlined, ThunderstormOutlined,
  ThermostatOutlined, WaterDropOutlined, AirOutlined as WindIcon,
} from '@mui/icons-material';
import { olentiaColors } from '@/lib/theme';
import { DRAWER_WIDTH } from './Sidebar';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  city: string;
  main: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
  Clear: <WbSunnyOutlined sx={{ fontSize: 20, color: '#FFB300' }} />,
  Clouds: <CloudOutlined sx={{ fontSize: 20, color: '#78909C' }} />,
  Rain: <GrainOutlined sx={{ fontSize: 20, color: '#42A5F5' }} />,
  Drizzle: <GrainOutlined sx={{ fontSize: 20, color: '#64B5F6' }} />,
  Thunderstorm: <ThunderstormOutlined sx={{ fontSize: 20, color: '#7E57C2' }} />,
  Snow: <AcUnitOutlined sx={{ fontSize: 20, color: '#B3E5FC' }} />,
  Mist: <AirOutlined sx={{ fontSize: 20, color: '#90A4AE' }} />,
  Fog: <AirOutlined sx={{ fontSize: 20, color: '#90A4AE' }} />,
  Night: <NightsStayOutlined sx={{ fontSize: 20, color: '#5C6BC0' }} />,
};

interface InfoBarProps {
  sidebarOpen: boolean;
}

export default function InfoBar({ sidebarOpen }: InfoBarProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const getCoords = (): Promise<{ lat: number; lon: number }> =>
      new Promise((resolve) => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve({ lat: 41.0082, lon: 28.9784 }),
            { timeout: 5000 }
          );
        } else {
          resolve({ lat: 41.0082, lon: 28.9784 });
        }
      });

    getCoords().then(({ lat, lon }) => {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=4d8fb5b93d4af21d66a2948710284366`)
        .then(r => r.json())
        .then(data => {
          if (data.main) {
            const hour = new Date().getHours();
            const isNight = hour < 6 || hour > 20;
            setWeather({
              temp: Math.round(data.main.temp),
              feels_like: Math.round(data.main.feels_like),
              humidity: data.main.humidity,
              wind_speed: Math.round((data.wind?.speed || 0) * 3.6),
              description: data.weather[0].description,
              city: data.name,
              main: isNight && data.weather[0].main === 'Clear' ? 'Night' : data.weather[0].main,
            });
          }
        })
        .catch(() => {});
    });
  }, []);

  if (!weather) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        left: { md: sidebarOpen ? DRAWER_WIDTH : 0 },
        right: 0,
        height: 36,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0E0E0E' : '#F5F0E8',
        borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        zIndex: (theme) => theme.zIndex.drawer,
        transition: 'left 0.2s ease-in-out',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{
        width: '100%',
        '@keyframes weatherFloat': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        '@keyframes weatherSpin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        '@keyframes weatherPulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        '@keyframes weatherShake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-1px) rotate(-2deg)' },
          '75%': { transform: 'translateX(1px) rotate(2deg)' },
        },
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateX(-10px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes dropBounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-3px)' },
          '60%': { transform: 'translateY(1px)' },
        },
        '@keyframes windBlow': {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.15)' },
        },
      }}>
        {/* Weather info */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ animation: 'slideIn 0.6s ease-out' }}>
          <Box sx={{
            display: 'flex',
            animation: weather.main === 'Clear' ? 'weatherSpin 12s linear infinite'
              : weather.main === 'Clouds' || weather.main === 'Fog' || weather.main === 'Mist' ? 'weatherFloat 4s ease-in-out infinite'
              : weather.main === 'Rain' || weather.main === 'Drizzle' ? 'weatherShake 1.5s ease-in-out infinite'
              : weather.main === 'Night' ? 'weatherPulse 3s ease-in-out infinite'
              : 'weatherFloat 3s ease-in-out infinite',
          }}>
            {weatherIcons[weather.main] || <CloudOutlined sx={{ fontSize: 20 }} />}
          </Box>
          <Typography variant="body2" fontWeight={600} sx={{
            fontSize: 13,
            animation: 'weatherPulse 4s ease-in-out infinite',
          }}>
            {weather.temp}°
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {weather.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📍 {weather.city}
          </Typography>
        </Stack>

        <Box sx={{ flex: 1 }} />

        {/* Weather details */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ animation: 'slideIn 0.8s ease-out' }}>
            <ThermostatOutlined sx={{ fontSize: 14, color: 'text.secondary', animation: 'weatherPulse 3s ease-in-out infinite' }} />
            <Typography variant="caption" color="text.secondary">Hissedilen</Typography>
            <Typography variant="caption" fontWeight={600}>{weather.feels_like}°</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ animation: 'slideIn 1s ease-out' }}>
            <WaterDropOutlined sx={{ fontSize: 14, color: 'text.secondary', animation: 'dropBounce 2.5s ease-in-out infinite' }} />
            <Typography variant="caption" color="text.secondary">Nem</Typography>
            <Typography variant="caption" fontWeight={600}>%{weather.humidity}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ animation: 'slideIn 1.2s ease-out' }}>
            <WindIcon sx={{ fontSize: 14, color: 'text.secondary', animation: 'windBlow 2s ease-in-out infinite' }} />
            <Typography variant="caption" color="text.secondary">Rüzgar</Typography>
            <Typography variant="caption" fontWeight={600}>{weather.wind_speed} km/h</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
