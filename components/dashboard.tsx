'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
      return !(
        (year === 1994 || year === 1995) &&
        (
          item["Growth rate from a Real GDP"] !== undefined ||
          item["IPCA Inflation Rate (% Annual Variation)"] !== undefined ||
          item["Minimum Wage Growth Rate percentage"] !== undefined ||
          item["Growth rate from a Real GDP per capita"] !== undefined ||
          item["Trade Balance Surplus Growth Rate"] !== undefined ||
          item["Exchange Rate (January,/R$USD) growth"] !== undefined 
        )
      );
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
        : item["Minimum Wage (in R$)"],
      "Trade Balance Surplus Growth Rate": typeof item["Trade Balance Surplus Growth Rate"] === 'string'
        ? parseFloat(item["Trade Balance Surplus Growth Rate"].replace(/\s/g, '').replace('.', '').replace(',', '.'))
        : item["Trade Balance Surplus Growth Rate"],
      "Exchange Rate (January,/R$USD) growth": typeof item["Exchange Rate (January,/R$USD) growth"] === 'string'
        ? parseFloat(item["Exchange Rate (January,/R$USD) growth"].replace(/\s/g, '').replace('.', '').replace(',', '.'))
        : item["Exchange Rate (January,/R$USD) growth"]
    }))
}

  const renderComparativeGraphs = () => {
    const chartData = prepareChartData(economicData)

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
              <p className="text-sm text-gray-500 mt-2">Note: Data shown from 1996 onwards to exclude outlier values from earlier years.</p>
            )}
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-8">
        {renderChart("GDP Growth Rates", {
          "Growth rate from a Real GDP": { label: "Real GDP Growth", color: "hsl(0, 70%, 50%)" },
          "Growth rate from a Real GDP per capita": { label: "Real GDP per Capita Growth", color: "hsl(120, 70%, 50%)" }
        }, 'line', true)}
        {renderChart("Inflation Rate vs Minimum Wage Growth", {
          "IPCA Inflation Rate (% Annual Variation)": { label: "Inflation Rate", color: "hsl(0, 70%, 50%)" },
          "Minimum Wage Growth Rate percentage": { label: "Minimum Wage Growth", color: "hsl(120, 70%, 50%)" }
        }, 'line', true)}
        {renderChart("Exchange Rate vs Trade Balance Surplus Growth", {
          "Exchange Rate (January,R$/USD)": { label: "Exchange Rate", color:  "hsl(0, 70%, 50%)" },
          "Trade Balance Surplus Growth Rate": { label: "Trade Balance Surplus Growth", color: "hsl(120, 70%, 50%)" }
        }, 'line')}
        {renderChart("Foreign Direct Investment vs Nominal GDP", {
          "Nominal GDP (in Millions of R$)": { label: "Nominal GDP (Billions of R$)", color: "hsl(0, 70%, 50%)" },
          "Foreign Direct Investment (IED,in Billions of R$)": { label: "Foreign Direct Investment", color: "hsl(120, 70%, 50%)" }
        }, 'scatter')}
        {renderChart("Unemployment Rate vs Minimum Wage", {
          "Minimum Wage (in R$)": { label: "Minimum Wage", color: "hsl(0, 70%, 50%)" },
          "Annual Average Unemployment Rate (%)": { label: "Unemployment Rate", color: "hsl(120, 70%, 50%)" }
        }, 'scatter')}
        {renderChart("Exchange Rate Growth vs Cost of Living", {
          "Exchange Rate (January,/R$USD) growth": { label: "Exchange Rate Growth", color: "hsl(0, 70%, 50%)" },
          "Yearly Cost of Living Index (ICV)(Avg. % Change)": { label: "Cost of Living Change", color: "hsl(120, 70%, 50%)" }
        }, 'line')}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 shadow-md">
        <h1 className="text-3xl font-bold text-white text-center">Brazilian Economic Data between 1994 - 2022</h1>
      </div>
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            {currentPage === 'home' ? <CardTitle>Economic Data Analysis</CardTitle> : <CardTitle>Filter and View Data</CardTitle>}
            {currentPage === 'home' ? <CardDescription>Explore and compare economic data</CardDescription> : <CardDescription>Select filters and data points to display</CardDescription>}
          </CardHeader>
          <CardContent>
            {currentPage === 'home' && (
              <div className="space-y-4">
                <Button 
                  onClick={() => handleHomeButtonClick('dataset')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:bg-black transition-colors duration-300"
                >
                  View Dataset
                </Button>
                <Button 
                  onClick={() => handleHomeButtonClick('comparative')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:bg-black transition-colors duration-300"
                >
                  View Comparative Data
                </Button>
                <Button 
                  onClick={() => handleHomeButtonClick('graphs')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:bg-black transition-colors duration-300"
                >
                  View Graphs
                </Button>
              </div>
            )}
            {currentPage === 'dataset' && (
              <div className="space-y-4">
                <div className="flex space-x-4 mb-4">
                  <Select onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedPresident}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by President" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Presidents</SelectItem>
                      {presidents.map(president => (
                        <SelectItem key={president}    value={president}>{president}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dataPoints.map(dataPoint => (
                    <Button
                      key={dataPoint.name}
                      variant={selectedDataPoints.some(dp => dp.name === dataPoint.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDataPointToggle(dataPoint)}
                      className="text-xs"
                    >
                      {dataPoint.name}
                    </Button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  {filteredData.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2">Year</th>
                          <th className="border border-gray-300 p-2">President</th>
                          {selectedDataPoints.map(dataPoint => (
                            <th key={dataPoint.name} className="border border-gray-300 p-2">
                              {dataPoint.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 p-2">{item.Year}</td>
                            <td className="border border-gray-300 p-2">{item.Presidents}</td>
                            {selectedDataPoints.map(dataPoint => (
                              <td key={dataPoint.name} className="border border-gray-300 p-2">
                                {item[dataPoint.name as keyof EconomicData]?.toString() || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No data available. Please adjust your filters or check the data source.</p>
                  )}
                </div>
              </div>
            )}
            {currentPage === 'comparative' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comparative Data View</h3>
                {renderComparativeGraphs()}
              </div>
            )}
            {currentPage === 'graphs' && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold">Economic Data Graphs</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dataPoints.map(dataPoint => (
                    <Button
                      key={dataPoint.name}
                      variant={selectedGraphs.includes(dataPoint.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGraphToggle(dataPoint.name)}
                      className="text-xs"
                    >
                      {dataPoint.name}
                    </Button>
                  ))}
                </div>
                {selectedGraphs.length === 0 && (
                  <p>Please select one or more graphs to display.</p>
                )}
                {selectedGraphs.map((graphName, index) => (
                  <Card key={graphName}>
                    <CardHeader>
                      <CardTitle>{graphName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          [graphName]: {
                            label: graphName,
                            color: `hsl(${(index * 30) % 360}, 70%, 50%)`,
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={prepareChartData(economicData)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Year" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey={graphName}
                              stroke={`hsl(${(index * 30) % 360}, 70%, 50%)`}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentPage !== 'home' && (
              <Button onClick={() => setCurrentPage('home')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:bg-black transition-colors duration-300">
                Back to Home
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
