'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface EconomicData {
  Presidents: string;
  Year: string;
  "Nominal GDP (in Millions of R$)": number;
  "Growth rate from a Real GDP": number;
  "Nominal GDP per Capita (in R$)": string | number;
  "Growth rate from a Real GDP per capita": number;
  "Exchange Rate (January,R$/USD)": number;
  "Exchange Rate (January,/R$USD) growth": number;
  "Foreign Direct Investment (IED,in Billions of R$)": number;
  "Foreign Portfolio Investment (USD millions) in the 4th quarter": number;
  "Trade Balance Surplus Growth Rate": string | number;
  "IPCA Inflation Rate (% Annual Variation)": number;
  "Annual Average Unemployment Rate (%)": number;
  "Minimum Wage (in R$)": string | number;
  "Minimum Wage Growth Rate percentage": number;
  "Yearly Cost of Living Index (ICV)(Avg. % Change)": number;
}

interface DataPoint {
  name: string;
  index: number;
}

const dataPoints: DataPoint[] = [
  { name: "Nominal GDP (in Millions of R$)", index: 0 },
  { name: "Growth rate from a Real GDP", index: 1 },
  { name: "Nominal GDP per Capita (in R$)", index: 2 },
  { name: "Growth rate from a Real GDP per capita", index: 3 },
  { name: "Exchange Rate (January,R$/USD)", index: 4 },
  { name: "Exchange Rate (January,/R$USD) growth", index: 5 },
  { name: "Foreign Direct Investment (IED,in Billions of R$)", index: 6 },
  { name: "Foreign Portfolio Investment (USD millions) in the 4th quarter", index: 7 },
  { name: "Trade Balance Surplus Growth Rate", index: 8 },
  { name: "IPCA Inflation Rate (% Annual Variation)", index: 9 },
  { name: "Annual Average Unemployment Rate (%)", index: 10 },
  { name: "Minimum Wage (in R$)", index: 11 },
  { name: "Minimum Wage Growth Rate percentage", index: 12 },
  { name: "Yearly Cost of Living Index (ICV)(Avg. % Change)", index: 13 }
]

export default function EconomicDashboard() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedPresident, setSelectedPresident] = useState<string | null>(null)
  const [selectedDataPoints, setSelectedDataPoints] = useState<DataPoint[]>(dataPoints)
  const [economicData, setEconomicData] = useState<EconomicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<'home' | 'dataset' | 'comparative' | 'graphs'>('home')
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dashboard-BdBYHcDrNjdqjW431nlwnj7DIeQ7m9.json')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const jsonData: EconomicData[] = await response.json()
        setEconomicData(jsonData)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error fetching data. Please try again later.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDataPointToggle = (dataPoint: DataPoint) => {
    setSelectedDataPoints(prev => 
      prev.some(dp => dp.name === dataPoint.name)
        ? prev.filter(dp => dp.name !== dataPoint.name)
        : [...prev, dataPoint].sort((a, b) => a.index - b.index)
    )
  }

  const handleHomeButtonClick = (page: 'dataset' | 'comparative' | 'graphs') => {
    setCurrentPage(page)
    if (page === 'dataset') {
      setSelectedDataPoints(dataPoints)
    }
    if (page === 'graphs') {
      setSelectedGraphs([])
    }
  }

  const handleGraphToggle = (graphName: string) => {
    setSelectedGraphs(prev => 
      prev.includes(graphName)
        ? prev.filter(name => name !== graphName)
        : [...prev, graphName]
    )
  }

  const years = Array.from(new Set(economicData.map(item => item.Year)))
    .sort((a, b) => parseInt(b) - parseInt(a))
  const presidents = Array.from(new Set(economicData.map(item => item.Presidents)))

  const filteredData = economicData.filter(item => {
    const yearMatch = !selectedYear || selectedYear === 'all' || item.Year === selectedYear
    const presidentMatch = !selectedPresident || selectedPresident === 'all' || item.Presidents === selectedPresident
    return yearMatch && presidentMatch
  })

  const prepareChartData = (data: EconomicData[], removeOutliers: boolean = false) => {
    return data
      .filter(item => {
        if (!removeOutliers) return true;
        const year = parseInt(item.Year);
        return year >= 1996;  // Only include data from 1996 onwards
      })
      .map(item => ({
        ...item,
        "Nominal GDP (in Millions of R$)": item["Nominal GDP (in Millions of R$)"] / 1000,
        "Nominal GDP per Capita (in R$)": typeof item["Nominal GDP per Capita (in R$)"] === 'string' 
          ? parseFloat(item["Nominal GDP per Capita (in R$)"].replace(/\s/g, '').replace(',', '.'))
          : item["Nominal GDP per Capita (in R$)"],
        "Trade Balance Surplus Growth Rate": typeof item["Trade Balance Surplus Growth Rate"] === 'string'
          ? parseFloat(item["Trade Balance Surplus Growth Rate"].replace(',', '.'))
          : item["Trade Balance Surplus Growth Rate"],
        "Minimum Wage (in R$)": typeof item["Minimum Wage (in R$)"] === 'string'
          ? parseFloat(item["Minimum Wage (in R$)"].replace(/\s/g, '').replace('.', '').replace(',', '.'))
          : item["Minimum Wage (in R$)"]
      }))
  }

  const renderComparativeGraphs = () => {
    const renderChart = (title: string, config: Record<string, { label: string; color: string }>, chartType: 'line' | 'scatter', removeOutliers: boolean = false) => {
      const dataKeys = Object.keys(config);
      if (dataKeys.length === 0) return null;

      const chartData = prepareChartData(economicData, removeOutliers);

      return (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                Object.entries(config).map(([key, value]) => [
                  key,
                  {
                    label: value?.label || key,
                    color: value?.color || `hsl(${Math.random() * 360}, 70%, 50%)`,
                  },
                ])
              )}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {dataKeys.map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config[key]?.color || `hsl(${Math.random() * 360}, 70%, 50%)`}
                        name={config[key]?.label || key}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={dataKeys[0]} name={config[dataKeys[0]]?.label || dataKeys[0]} />
                    <YAxis dataKey={dataKeys[1]} name={config[dataKeys[1]]?.label || dataKeys[1]} />
                    <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                    <Scatter name={title} data={chartData} fill={config[dataKeys[0]]?.color || `hsl(${Math.random() * 360}, 70%, 50%)`} />
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
            {removeOutliers && (
              <p className="text-sm text-gray-500 mt-2">Note: Outliers for the years 1994 and 1995 were removed to improve data clarity.</p>
            )}
          </CardContent>
        </Card>
      );
    };

    return (
      <div>
        {renderChart(
          "GDP Growth Rates",
          {
            "Growth rate from a Real GDP": { label: "Real GDP Growth Rate", color: "blue" },
            "Growth rate from a Real GDP per capita": { label: "GDP per Capita Growth Rate", color: "green" }
          },
          "line",
          true // removeOutliers flag set to true
        )}
        {renderChart(
          "Inflation Rate vs Minimum Wage Growth",
          {
            "IPCA Inflation Rate (% Annual Variation)": { label: "Inflation Rate", color: "red" },
            "Minimum Wage Growth Rate percentage": { label: "Minimum Wage Growth Rate", color: "purple" }
          },
          "line",
          true // removeOutliers flag set to true
        )}
        {/* Add additional graphs as needed */}
      </div>
    );
  };

  return (
    <div>
      {/* Home, Dataset, Comparative, Graphs UI */}
      <Button onClick={() => handleHomeButtonClick('graphs')}>Go to Graphs</Button>
      {currentPage === 'graphs' && renderComparativeGraphs()}
    </div>
  );
}
