## Greenloop: Strategic Renewable Energy Advisor

Greenloop is a modern, full-stack web application designed to provide strategic advice for renewable energy optimization. The application leverages interactive maps, an AI-powered chat assistant, and dynamic data visualizations to help you analyze the potential of solar and wind energy at various locations.

## Features

- **Interactive Energy Dashboard**: Combines real-time mapping and data visualization to present renewable energy insights.
- **AI Chat Assistant**: Use the integrated chat to get scientifically accurate, concise recommendations based on location data.
- **Data Visualizations**: Dynamic charts and plots showcasing monthly trends in solar radiation and wind speeds.
- **External API Integration**: Retrieves data from external APIs including:
  - **NASA Power API** for solar and wind energy data
  - **Google Maps Static API** for satellite imagery
  - **Cohere Chat API** for generating energy analysis
  - **Mapbox** for interactive, high-quality mapping

## Tech Stack

- **Framework**: Next.js with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Integrated Plotly for responsive charts and graphs

## Project Structure

The project is organized as follows:

- **app/**: Contains the main application layout and page components.
- **components/**: Includes reusable React components such as the energy dashboard, chat interface, maps, and UI components.
- **lib/**: Utility functions and type declarations for interacting with external APIs and processing renewable energy data.
- **css/**, **public/**: Static assets and styling files.

## Prerequisites

Ensure you have the following installed:

- Node.js (latest LTS version recommended)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/greenloop.git
   ```
2. Navigate to the project directory:
   ```bash
   cd greenloop
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

Start the development server with:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Environment Variables

Make sure to configure the following environment variables in a `.env.local` file:

- `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox API token for the interactive map.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for satellite imagery.
- `NEXT_PUBLIC_COHERE_API_KEY`: Your Cohere API key for the AI analysis.

Additional environment variables may be required for external API integrations. Refer to the project documentation for details.

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
