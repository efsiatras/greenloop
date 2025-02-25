"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Bot } from "lucide-react"
import { geocodeLocation } from "@/lib/utils"
import { CohereClientV2 } from 'cohere-ai'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div>Loading plot...</div>
})

// Initialize Cohere client with your API key
const cohere = new CohereClientV2({
  token: process.env.NEXT_PUBLIC_COHERE_API_KEY
});

interface ChatProps {
  onLocationUpdate: (lat: number, lng: number) => void;
  onFormSubmit: () => void;
}

interface Message {
  text: string;
  type: 'user' | 'system';
  coordinates?: {
    lat: number;
    lng: number;
  };
  satelliteImageUrl?: string;
  data?: {
    aggregated: {
      solar: { radiation: number, cloudCover: number, temperature: number },
      wind: { speed: number, airDensity: number },
    },
    monthly: {
      solar: { monthlyRadiation: Record<number, number> },
      wind: { monthlyWind10m: Record<number, number>, monthlyWind50m: Record<number, number> },
    }
  };
  isTyping?: boolean;
}

function EnergyPlots({ monthlyData, onRender }: { 
  monthlyData: NonNullable<Message["data"]>["monthly"],
  onRender?: () => void 
}) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  useEffect(() => {
    const renderTimeout = setTimeout(() => {
      onRender?.();
    }, 300);
    return () => clearTimeout(renderTimeout);
  }, [onRender]);

  return (
    // <div className="space-y-6 mt-4">
    //   {/* Pie Chart for Land Cover Distribution */}
    //   <div>
    //     <h3 className="font-medium">Land Cover Distribution</h3>
    //     <Plot
    //       data={[
    //         {
    //           labels: ['Trees', 'Cropland', 'Built-up', 'Bare / Sparse vegetation'],
    //           values: [2.3, 68.7, 25.6, 3.4],
    //           type: 'pie',
    //           marker: {
    //             // Example color palette: green, yellow, orange, gray
    //             colors: ['#27ae60', '#f1c40f', '#e67e22', '#95a5a6'],
    //           },
    //         },
    //       ]}
    //       layout={{ title: 'Land Cover Pie Chart', autosize: true }}
    //       style={{ width: '100%', height: '300px' }}
    //     />
    //   </div>

      {/* Monthly Solar Radiation */}
      <div>
        <h3 className="font-medium">Monthly Solar Radiation (W/m²)</h3>
        <Plot
          data={[
            {
              x: months,
              y: Object.values(monthlyData.solar.monthlyRadiation) as number[],
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: "hsl(122, 52%, 53%)" },
            },
          ]}
          layout={{ title: 'Monthly Solar Radiation', autosize: true }}
          style={{ width: '100%', height: '300px' }}
        />
      </div>

      {/* Monthly Wind Speeds */}
      <div>
        <h3 className="font-medium">Monthly Wind Speeds (m/s)</h3>
        <Plot
          data={[
            {
              x: months,
              y: Object.values(monthlyData.wind.monthlyWind10m) as number[],
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Wind 10m',
              marker: { color: "hsl(122, 52%, 23%)" },
            },
            {
              x: months,
              y: Object.values(monthlyData.wind.monthlyWind50m) as number[],
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Wind 50m',
              marker: { color: "hsl(122, 52%, 65%)" },
            },
          ]}
          layout={{ title: 'Monthly Wind Speeds', autosize: true }}
          style={{ width: '100%', height: '300px' }}
        />
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-3 mt-4">
      <div className="w-3 h-3 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 rounded-full bg-primary/40 animate-bounce"></div>
    </div>
  )
}

const getSatelliteImage = (lat: number, lng: number, zoom = 15, size = "600x300") => {
  const API_KEY = "AIzaSyC1cMCt9bc2xu2sgUx4Z1pdfZHdm1yEoeE";
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=satellite&key=${API_KEY}`;
};

export default function Chat({ onLocationUpdate, onFormSubmit }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'system',
    text: "Hi! I'm **Physis**. Share a location, and I'll analyze its renewable energy potential focusing on Solar and Wind energy."
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages]);

  const handlePlotRendered = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const parseCoordinates = (text: string): { lat: number, lng: number } | null => {
    const decimalRegex = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/;
    const degreesRegex = /(\d+\.?\d*)\s*°?\s*([NSns])[,\s]+(\d+\.?\d*)\s*°?\s*([EWew])/;
    
    const decimalMatch = text.match(decimalRegex);
    if (decimalMatch) {
      const lat = parseFloat(decimalMatch[1]);
      const lng = parseFloat(decimalMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    
    const degreesMatch = text.match(degreesRegex);
    if (degreesMatch) {
      let lat = parseFloat(degreesMatch[1]);
      let lng = parseFloat(degreesMatch[3]);
      if (degreesMatch[2].toUpperCase() === 'S') lat = -lat;
      if (degreesMatch[4].toUpperCase() === 'W') lng = -lng;
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    
    return null;
  }

  const getEnergyAdvice = async (location: string, coordinates: { lat: number, lng: number }) => {
    try {
      const startyear = 2021;
      const endyear = 2023;

      const parameters = [
        'ALLSKY_SFC_SW_DWN',  // Solar radiation
        'CLOUD_AMT',          // Cloud cover
        'T2M',                // Temperature
        'WS10M',              // Wind speed at 10m
        'WS50M',              // Wind speed at 50m
        'PS'                  // Pressure (for air density)
      ].join(',');

      const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameters}&community=SB&longitude=${coordinates.lng}&latitude=${coordinates.lat}&start=${startyear}&end=${endyear}&format=JSON`;
      console.log('Fetching data from NASA API:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NASA API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const apiData = data.properties.parameter;

      // Initialize monthly records
      const monthlyRadiation: Record<number, number> = {};
      const monthlyWind10m: Record<number, number> = {};
      const monthlyWind50m: Record<number, number> = {};
      const monthlyAirDensity: Record<number, number> = {};

      for (let month = 1; month <= 12; month++) {
        monthlyRadiation[month] = 0;
        monthlyWind10m[month] = 0;
        monthlyWind50m[month] = 0;
        monthlyAirDensity[month] = 0;
      }

      // Sum up monthly data over the period
      for (let year = startyear; year <= endyear; year++) {
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0');
          const key = `${year}${monthStr}`;
          
          if (apiData['ALLSKY_SFC_SW_DWN'][key]) {
            monthlyRadiation[month] += apiData['ALLSKY_SFC_SW_DWN'][key];
            monthlyWind10m[month] += apiData['WS10M'][key];
            monthlyWind50m[month] += apiData['WS50M'][key];

            const R = 287.05; // Gas constant for dry air
            const P = apiData['PS'][key] * 1000; // Convert kPa to Pa
            const T = apiData['T2M'][key] + 273.15; // Convert °C to K
            monthlyAirDensity[month] += P / (R * T);
          }
        }
      }

      // Average the values over the years
      for (let month = 1; month <= 12; month++) {
        monthlyRadiation[month] /= (endyear - startyear + 1);
        monthlyWind10m[month] /= (endyear - startyear + 1);
        monthlyWind50m[month] /= (endyear - startyear + 1);
        monthlyAirDensity[month] /= (endyear - startyear + 1);
      }

      const meanAirDensity = Object.values(monthlyAirDensity).reduce((a, b) => a + b, 0) / 12;

      let totalCloudCover = 0;
      let totalTemperature = 0;
      let countMonths = 0;

      for (let year = startyear; year <= endyear; year++) {
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0');
          const key = `${year}${monthStr}`;
          
          if (apiData['CLOUD_AMT'][key]) {
            totalCloudCover += apiData['CLOUD_AMT'][key];
            totalTemperature += apiData['T2M'][key];
            countMonths++;
          }
        }
      }

      // Aggregated data for Solar and Wind
      const renewableData = {
        solar: {
          meanRadiation: Object.values(monthlyRadiation).reduce((a, b) => a + b, 0) / 12,
          cloudCover: totalCloudCover / countMonths,
          temperature: totalTemperature / countMonths
        },
        wind: {
          meanSpeed50m: Object.values(monthlyWind50m).reduce((a, b) => a + b, 0) / 12,
          airDensity: meanAirDensity
        }
      };

      const formattedData = {
        solar: {
          radiation: renewableData.solar.meanRadiation,
          cloudCover: renewableData.solar.cloudCover,
          temperature: renewableData.solar.temperature
        },
        wind: {
          speed: renewableData.wind.meanSpeed50m,
          airDensity: renewableData.wind.airDensity
        }
      };

      // Construct the prompt (excluding hydropower, and considering proximity to a city)
      const prompt = `nalyze the renewable energy potential for location: ${location} (${coordinates.lat}, ${coordinates.lng})

Data provided (averaged over 3 years, 2021-2023):

Solar Energy Data:
- Average Solar Radiation: ${formattedData.solar.radiation.toFixed(2)} W/m²
- Average Cloud Cover: ${formattedData.solar.cloudCover.toFixed(2)}%
- Average Temperature: ${formattedData.solar.temperature.toFixed(2)}°C

Wind Energy Data:
- Average Wind Speed at 50m: ${formattedData.wind.speed.toFixed(2)} m/s
- Average Air Density: ${formattedData.wind.airDensity.toFixed(3)} kg/m³

Please provide a concise, scientifically accurate analysis focusing only on Solar and Wind energy potential. Do not consider hydropower or other energy forms.

Additionally, consider the proximity of the location to the nearest city. If the site is near a major urban center, note that it is generally more favorable due to better infrastructure and higher energy demand.

Your response should have the following structure:
**Short Summary**: A brief (2-3 sentences) statement summarizing the recommended renewable energy option based on the data.

**Solar Energy Analysis**: Evaluate solar potential based on solar radiation, cloud cover, and temperature. Include recommendations for panel configurations.

**Wind Energy Analysis**: Evaluate wind potential based on wind speed and air density. Suggest suitable turbine types.

**Overall Recommendation**: Rank the renewable options (Solar vs. Wind with > or <) based on the data, considering estimated energy generation, cost-effectiveness, and proximity to a city.

Keep the response concise and strictly based on the provided data.`;

      // Call Cohere Chat API v2 with streaming disabled
      const chatResponse = await cohere.chat({
        model: 'command-r-plus-08-2024',
        messages: [
          {
            role: 'system',
            content: "You are an Energy Advisor who provides scientifically accurate analyses on renewable energy potential based on historical data."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const messageContent = Array.isArray(chatResponse.message.content)
        ? chatResponse.message.content.map(part => part.text).join('')
        : chatResponse.message.content || '';

      const normalizedText = messageContent
      // replace(/\n\s*\n/g, '\n');

      return {
        text: normalizedText,
        data: {
          aggregated: formattedData,
          monthly: {
            solar: { monthlyRadiation },
            wind: { monthlyWind10m, monthlyWind50m }
          }
        }
      };

    } catch (error) {
      console.error('Error getting energy advice:', error);
      if (error instanceof Error) {
        return {
          text: `Sorry, I could not analyze this location at the moment. Error: ${error.message}`,
          data: null
        };
      }
      return {
        text: 'Sorry, I could not analyze this location at the moment. Please try again.',
        data: null
      };
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onFormSubmit();
    setIsLoading(true);
    setInput("");
    
    setMessages(prev => [...prev, { text: input, type: 'user' }]);

    try {
      const coords = parseCoordinates(input);
      let location: string;
      let coordinates: { lat: number, lng: number };

      if (coords) {
        coordinates = coords;
        location = `${coords.lat}, ${coords.lng}`;
        onLocationUpdate(coords.lat, coords.lng);
      } else {
        const result = await geocodeLocation(input);
        if (!result.success) {
          throw new Error(result.error);
        }
        coordinates = { lat: result.lat, lng: result.lng };
        location = result.formattedAddress;
        onLocationUpdate(result.lat, result.lng);
      }

      setMessages(prev => [...prev, { 
        text: `Analyzing renewable energy potential for ${location}...`,
        type: 'system',
        coordinates,
        isTyping: true,
        satelliteImageUrl: getSatelliteImage(coordinates.lat, coordinates.lng)
      }]);

      const { text, data } = await getEnergyAdvice(location, coordinates);
      
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isTyping);
        return [...newMessages, {
          text: text || 'Analysis complete',
          type: 'system',
          coordinates,
          data,
          satelliteImageUrl: getSatelliteImage(coordinates.lat, coordinates.lng)
        } as Message];
      });

    } catch (error) {
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isTyping);
        return [...newMessages, {
          text: error instanceof Error ? error.message : 'An error occurred',
          type: 'system'
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 scroll-smooth">
        {messages.map((message, i) => (
          <div 
            key={i} 
            className={`mb-4 p-3 rounded-lg opacity-0 animate-fadeIn ${
              message.type === 'user' 
                ? 'bg-primary/10 ml-8' 
                : 'bg-muted/50 mr-8'
            }`}
            style={{
              animationDelay: `${i * 200}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="flex items-center gap-2 text-sm">
              {message.type === 'user' ? (
                <>
                  <User className="h-5 w-5 text-primary" />
                  <span>You</span>
                </>
              ) : (
                <>
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Physis</span>
                </>
              )}
            </div>
            <div className="mt-2 text-pretty whitespace-pre-wrap">
              {message.isTyping ? (
                message.text
              ) : (
                <ReactMarkdown>
                  {message.text}
                </ReactMarkdown>
              )}
              {message.isTyping && <TypingIndicator />}
            </div>
            {message.type === 'system' && message.coordinates && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Satellite View:</h3>
                <img 
                  src={getSatelliteImage(message.coordinates.lat, message.coordinates.lng)} 
                  alt="Satellite view of location"
                  className="rounded-lg w-full max-w-[600px] h-auto"
                />
              </div>
            )}
            {message.type === 'system' && message.data && message.data.monthly && (
              <EnergyPlots 
                monthlyData={message.data.monthly} 
                onRender={handlePlotRendered}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-px" />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Analyzing..." : "Enter a location or coordinates..."}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
