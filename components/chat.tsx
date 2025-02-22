"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Bot } from "lucide-react"
import { geocodeLocation } from "@/lib/utils"
import { CohereClientV2 } from 'cohere-ai'
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false, // Disable server-side rendering
  loading: () => <div>Loading plot...</div>
})

// Initialize Cohere client with your API key
const cohere = new CohereClientV2({
  token: "K7dzLTRMsiVuSZmOpFxq5AtjLHNUfhZ27Lh1WVAd",
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
  data?: {
    aggregated: {
      solar: { radiation: number, cloudCover: number, temperature: number },
      wind: { speed: number, airDensity: number },
      hydro: { rainfall: number },
    },
    monthly: {
      solar: { monthlyRadiation: Record<number, number> },
      wind: { monthlyWind10m: Record<number, number>, monthlyWind50m: Record<number, number> },
      hydro: { monthlyRainfall: Record<number, number> },
    }
  };
  isTyping?: boolean;
}

// A component to render the energy plots
function EnergyPlots({ monthlyData, onRender }: { 
  monthlyData: Message["data"]['monthly'],
  onRender?: () => void 
}) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Call onRender when plots are ready
  useEffect(() => {
    const renderTimeout = setTimeout(() => {
      onRender?.();
    }, 300); // Wait for plots to be fully rendered

    return () => clearTimeout(renderTimeout);
  }, [onRender]);

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h3 className="font-medium">Monthly Solar Radiation (W/m²)</h3>
        <Plot
          data={[
            {
              x: months,
              y: Object.values(monthlyData.solar.monthlyRadiation),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'orange' },
            },
          ]}
          layout={{ title: 'Monthly Solar Radiation', autosize: true }}
          style={{ width: '100%', height: '300px' }}
        />
      </div>
      <div>
        <h3 className="font-medium">Monthly Wind Speeds (m/s)</h3>
        <Plot
          data={[
            {
              x: months,
              y: Object.values(monthlyData.wind.monthlyWind10m),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Wind 10m',
              marker: { color: 'blue' },
            },
            {
              x: months,
              y: Object.values(monthlyData.wind.monthlyWind50m),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Wind 50m',
              marker: { color: 'green' },
            },
          ]}
          layout={{ title: 'Monthly Wind Speeds', autosize: true }}
          style={{ width: '100%', height: '300px' }}
        />
      </div>
      <div>
        <h3 className="font-medium">Monthly Rainfall (mm)</h3>
        <Plot
          data={[
            {
              x: months,
              y: Object.values(monthlyData.hydro.monthlyRainfall),
              type: 'bar',
              marker: { color: 'blue' },
            },
          ]}
          layout={{ title: 'Monthly Rainfall', autosize: true }}
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

export default function Chat({ onLocationUpdate, onFormSubmit }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'system',
    text: "Hi! I'm your Energy Advisor. Share a location, and I'll analyze its renewable energy potential. You can type an address or coordinates (latitude, longitude)."
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update scroll behavior to be more reliable
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100); // Small delay to ensure content is rendered

      return () => clearTimeout(scrollTimeout);
    }
  }, [messages]);

  // Ensure scroll on new plots rendered
  const handlePlotRendered = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const parseCoordinates = (text: string): { lat: number, lng: number } | null => {
    const decimalRegex = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/
    const degreesRegex = /(\d+\.?\d*)\s*°?\s*([NSns])[,\s]+(\d+\.?\d*)\s*°?\s*([EWew])/
    
    const decimalMatch = text.match(decimalRegex)
    if (decimalMatch) {
      const lat = parseFloat(decimalMatch[1])
      const lng = parseFloat(decimalMatch[2])
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
    
    const degreesMatch = text.match(degreesRegex)
    if (degreesMatch) {
      let lat = parseFloat(degreesMatch[1])
      let lng = parseFloat(degreesMatch[3])
      
      if (degreesMatch[2].toUpperCase() === 'S') lat = -lat
      if (degreesMatch[4].toUpperCase() === 'W') lng = -lng
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
    
    return null
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
        'PS',                 // Pressure
        'PRECTOTCORR'         // Precipitation (corrected)
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
      const monthlyRainfall: Record<number, number> = {};
      const monthlyAirDensity: Record<number, number> = {};

      for (let month = 1; month <= 12; month++) {
        monthlyRadiation[month] = 0;
        monthlyWind10m[month] = 0;
        monthlyWind50m[month] = 0;
        monthlyRainfall[month] = 0;
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
            monthlyRainfall[month] += apiData['PRECTOTCORR'][key];

            const R = 287.05; // Gas constant for dry air
            const P = apiData['PS'][key] * 1000; // kPa to Pa
            const T = apiData['T2M'][key] + 273.15; // °C to K
            monthlyAirDensity[month] += P / (R * T);
          }
        }
      }

      // Average the values over the number of years
      for (let month = 1; month <= 12; month++) {
        monthlyRadiation[month] /= (endyear - startyear + 1);
        monthlyWind10m[month] /= (endyear - startyear + 1);
        monthlyWind50m[month] /= (endyear - startyear + 1);
        monthlyRainfall[month] /= (endyear - startyear + 1);
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

      // Aggregated (average) data
      const renewableData = {
        solar: {
          meanRadiation: Object.values(monthlyRadiation).reduce((a, b) => a + b, 0) / 12,
          cloudCover: totalCloudCover / countMonths,
          temperature: totalTemperature / countMonths
        },
        wind: {
          meanSpeed50m: Object.values(monthlyWind50m).reduce((a, b) => a + b, 0) / 12,
          airDensity: meanAirDensity
        },
        hydro: {
          annualRainfall: Object.values(monthlyRainfall).reduce((a, b) => a + b, 0) * 365
        }
      };

      // Prepare the aggregated data for text output
      const formattedData = {
        solar: {
          radiation: renewableData.solar.meanRadiation,
          cloudCover: renewableData.solar.cloudCover,
          temperature: renewableData.solar.temperature
        },
        wind: {
          speed: renewableData.wind.meanSpeed50m,
          airDensity: renewableData.wind.airDensity
        },
        hydro: {
          rainfall: renewableData.hydro.annualRainfall
        }
      };

      // Create the prompt for Cohere using the aggregated values
      const prompt = `Analyze the renewable energy potential for location: ${location} (${coordinates.lat}, ${coordinates.lng})

Using the following real data averaged over 3 years (2021-2023):

Solar Data:
- Solar Radiation: ${formattedData.solar.radiation.toFixed(2)} W/m²
- Cloud Cover: ${formattedData.solar.cloudCover.toFixed(2)}%
- Temperature: ${formattedData.solar.temperature.toFixed(2)}°C

Wind Data:
- Wind Speed at 50m: ${formattedData.wind.speed.toFixed(2)} m/s
- Air Density: ${formattedData.wind.airDensity.toFixed(3)} kg/m³

Hydropower Data:
- Annual Rainfall: ${formattedData.hydro.rainfall.toFixed(2)} mm/year

Please provide a comprehensive analysis covering:

1. Solar Energy Potential:
   - Based on the 3-year average solar radiation and cloud cover data
   - Consider temperature impact on panel efficiency
   - Recommend optimal panel configurations

2. Wind Energy Feasibility:
   - Based on the measured wind speeds at 50m height and air density
   - Suggest suitable turbine types
   - Consider seasonal variations

3. Hydropower Potential:
   - Based on annual rainfall patterns
   - Consider seasonal variations
   - Suggest feasible hydropower solutions if applicable

4. Recommendations:
   - Rank the renewable options based on the historical data
   - Provide specific installation suggestions
   - Include estimated energy generation potential
   - Consider cost-effectiveness and seasonal reliability

Please provide practical, actionable recommendations based on this historical data.`;

      // Call Cohere Chat API v2 with streaming disabled
      const chatResponse = await cohere.chat({
        model: 'command-r-plus-08-2024',
        stream: false,
        messages: [
          {
            role: 'system',
            content: "You are an Energy Advisor who provides detailed analysis on renewable energy potential based on historical data."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      // Extract generated text from response message content (joining parts if necessary)
      const messageContent = Array.isArray(chatResponse.message.content)
        ? chatResponse.message.content.map(part => part.text).join('')
        : chatResponse.message.content;

      // Return both aggregated and monthly data for later plotting
      return {
        text: messageContent,
        data: {
          aggregated: formattedData,
          monthly: {
            solar: { monthlyRadiation },
            wind: { monthlyWind10m, monthlyWind50m },
            hydro: { monthlyRainfall }
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
    e.preventDefault()
    if (!input.trim() || isLoading) return

    onFormSubmit()
    setIsLoading(true)
    setInput("")
    setIsAnalyzing(true)
    
    setMessages(prev => [...prev, { text: input, type: 'user' }])

    try {
      const coords = parseCoordinates(input)
      let location: string
      let coordinates: { lat: number, lng: number }

      if (coords) {
        coordinates = coords
        location = `${coords.lat}, ${coords.lng}`
        onLocationUpdate(coords.lat, coords.lng)
      } else {
        const result = await geocodeLocation(input)
        if (!result.success) {
          throw new Error(result.error)
        }
        coordinates = { lat: result.lat, lng: result.lng }
        location = result.formattedAddress
        onLocationUpdate(result.lat, result.lng)
      }

      // Add analyzing message with typing indicator
      setMessages(prev => [...prev, { 
        text: `Analyzing renewable energy potential for ${location}...`,
        type: 'system',
        coordinates,
        isTyping: true
      }])

      const { text, data } = await getEnergyAdvice(location, coordinates)
      
      // Replace the analyzing message with the final response
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isTyping)
        return [...newMessages, {
          text,
          type: 'system',
          data
        }]
      })

    } catch (error) {
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isTyping)
        return [...newMessages, {
          text: error instanceof Error ? error.message : 'An error occurred',
          type: 'system'
        }]
      })
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
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
                  <span>Energy Advisor</span>
                </>
              )}
            </div>
            <div className="mt-2 text-pretty whitespace-pre-wrap">
              {message.text}
              {message.isTyping && <TypingIndicator />}
            </div>
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
