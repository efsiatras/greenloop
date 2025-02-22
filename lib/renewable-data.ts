interface RenewableData {
  solar: {
    monthlyRadiation: Record<number, number>;  // Monthly solar irradiance values
    meanRadiation: number;                     // Annual mean
    cloudCover: number;                        // Average cloud cover
    temperature: number;                       // Average temperature
  };
  wind: {
    speed10m: {
      monthly: Record<number, number>;         // Monthly wind speed at 10m
      mean: number;                           // Annual mean at 10m
    };
    speed50m: {
      monthly: Record<number, number>;         // Monthly wind speed at 50m
      mean: number;                           // Annual mean at 50m
    };
    turbulence: number;
    airDensity: number;
  };
  hydro: {
    elevation: number;
    rainfall: {
      monthly: Record<number, number>;         // Monthly rainfall values
      annual: number;                         // Total annual rainfall
    };
    slope?: number;                          // Optional slope data if available
  };
}

// Helper function to calculate mean of array
function calculateMean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// NASA POWER API for solar and wind data
export async function getRenewableData(lat: number, lng: number) {
  const year = new Date().getFullYear() - 1;  // Use previous year for complete data
  const params = [
    'ALLSKY_SFC_SW_DWN',  // Solar radiation
    'CLOUD_AMT',          // Cloud cover
    'T2M',               // Temperature at 2m
    'WS10M',             // Wind speed at 10m
    'WS50M',             // Wind speed at 50m
    'PS',                // Surface pressure for air density
    'PRECTOT'            // Precipitation
  ].join(',');
  
  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${params}&community=SB&longitude=${lng}&latitude=${lat}&start=${year}&end=${year}&format=JSON`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const params_data = data.properties.parameter;
    
    // Process monthly data
    const monthlyRadiation: Record<number, number> = {};
    const monthlyWind10m: Record<number, number> = {};
    const monthlyWind50m: Record<number, number> = {};
    const monthlyRainfall: Record<number, number> = {};
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const key = `${year}${monthStr}`;
      
      monthlyRadiation[month] = params_data.ALLSKY_SFC_SW_DWN[key];
      monthlyWind10m[month] = params_data.WS10M[key];
      monthlyWind50m[month] = params_data.WS50M[key];
      monthlyRainfall[month] = params_data.PRECTOT[key];
    }

    // Calculate air density
    const monthlyAirDensity = {};
    const R = 287.05; // Gas constant for dry air
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const key = `${year}${monthStr}`;
      
      // Convert pressure from hPa to Pa and temperature from °C to K
      const P = params_data.PS[key] * 100; // hPa to Pa
      const T = params_data.T2M[key] + 273.15; // °C to K
      
      // Calculate air density
      monthlyAirDensity[month] = P / (R * T);
    }

    const meanAirDensity = Object.values(monthlyAirDensity).reduce((a: number, b: number) => a + b, 0) / 12;

    return {
      solar: {
        monthlyRadiation,
        meanRadiation: Object.values(monthlyRadiation).reduce((a: number, b: number) => a + b, 0) / 12,
        cloudCover: Object.values(params_data.CLOUD_AMT).reduce((a: number, b: number) => a + b, 0) / 12,
        temperature: Object.values(params_data.T2M).reduce((a: number, b: number) => a + b, 0) / 12
      },
      wind: {
        speed10m: {
          monthly: monthlyWind10m,
          mean: Object.values(monthlyWind10m).reduce((a: number, b: number) => a + b, 0) / 12
        },
        speed50m: {
          monthly: monthlyWind50m,
          mean: Object.values(monthlyWind50m).reduce((a: number, b: number) => a + b, 0) / 12
        },
        airDensity: meanAirDensity
      },
      hydro: {
        rainfall: {
          monthly: monthlyRainfall,
          annual: Object.values(monthlyRainfall).reduce((a: number, b: number) => a + b, 0)
        }
      }
    };
  } catch (error) {
    console.error('Error fetching NASA POWER data:', error);
    throw error;
  }
}