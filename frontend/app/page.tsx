"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Eye,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Clock,
} from "lucide-react";

export default function ClimaPage() {
  const [city, setCity] = useState("Corrientes");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ city: string; timestamp: string }[]>(
    []
  );

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition?.toLowerCase() || "";
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return <Sun className="h-16 w-16 text-yellow-500" />;
    } else if (conditionLower.includes("cloud")) {
      return <Cloud className="h-16 w-16 text-gray-500" />;
    } else if (conditionLower.includes("rain")) {
      return <CloudRain className="h-16 w-16 text-blue-500" />;
    } else if (conditionLower.includes("snow")) {
      return <CloudSnow className="h-16 w-16 text-blue-200" />;
    } else if (
      conditionLower.includes("storm") ||
      conditionLower.includes("thunder")
    ) {
      return <Zap className="h-16 w-16 text-purple-500" />;
    }
    return <Sun className="h-16 w-16 text-yellow-500" />;
  };

  const getBackgroundGradient = (condition: string) => {
    const conditionLower = condition?.toLowerCase() || "";
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return "from-blue-400 via-blue-500 to-blue-600";
    } else if (conditionLower.includes("cloud")) {
      return "from-gray-400 via-gray-500 to-gray-600";
    } else if (conditionLower.includes("rain")) {
      return "from-slate-400 via-slate-500 to-slate-600";
    } else if (conditionLower.includes("snow")) {
      return "from-blue-200 via-blue-300 to-blue-400";
    }
    return "from-blue-400 via-blue-500 to-blue-600";
  };

  const fetchHistorial = async () => {
    try {
      const res = await fetch("http://34.63.16.40:8001/weather/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("No se pudo obtener el historial", err);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const buscarClima = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setWeather(null);
    setError("");

    try {
      const res = await fetch(
        `http://34.63.16.40:8001/weather?city=${encodeURIComponent(city)}`
      );
      if (!res.ok) {
        throw new Error("Ciudad no encontrada");
      }
      const data = await res.json();
      setWeather(data);
    } catch (error) {
      console.error("Error al consultar clima", error);
      setError("No se pudo obtener el clima. Verifica el nombre de la ciudad.");
    } finally {
      setLoading(false);
      fetchHistorial();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") buscarClima();
  };

  const buscarDesdeHistorial = (ciudad: string) => {
    setCity(ciudad);
    buscarClima();
  };

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${
        weather
          ? `bg-gradient-to-br ${getBackgroundGradient(weather.condition)}`
          : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            ☀️ Clima Mundial
          </h1>
          <p className="text-blue-100 text-lg">
            Consulta el clima de cualquier ciudad del mundo
          </p>
        </div>

        {/* Search */}
        <Card className="max-w-md mx-auto mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Ciudad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCity(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Ej: Buenos Aires, Madrid, París..."
                className="flex-1 text-lg"
                disabled={loading}
              />
              <Button
                onClick={buscarClima}
                disabled={loading || !city.trim()}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historial de ciudades */}
        {history.length > 0 && (
          <Card className="max-w-md mx-auto mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Búsquedas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700 text-sm">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b pb-1 cursor-pointer hover:text-blue-600 transition"
                  onClick={() => buscarDesdeHistorial(item.city)}
                >
                  <span>{item.city}</span>
                  <span className="text-gray-500">
                    {new Date(item.timestamp).toLocaleString("es-ES")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="max-w-lg mx-auto shadow-2xl border-0 bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-2">
                <Cloud className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Clima */}
        {weather && !loading && (
          <Card className="max-w-2xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-2xl md:text-3xl text-gray-800">
                  {weather.location}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="mx-auto w-fit">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
                  {Math.round(weather.temp_c)}°C
                </div>
                <p className="text-xl text-gray-600 capitalize">
                  {weather.condition}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
