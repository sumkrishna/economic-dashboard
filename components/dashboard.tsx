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

const comparativeGraphs = [
  { title: "GDP Growth Rates", id: "gdp-growth" },
  { title: "Inflation Rate vs Minimum Wage Growth", id: "inflation-wage" },
  { title: "Exchange Rate vs Trade Balance Surplus Growth", id: "exchange-trade" },
  { title: "Foreign Direct Investment vs Nominal GDP", id: "fdi-gdp" },
  { title: "Unemployment Rate vs Minimum Wage", id: "unemployment-wage" },
  // { title: "Exchange Rate Growth vs Cost of Living", id: "exchange-col" }
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
  const [selectedComparativeGraphs, setSelectedComparativeGraphs] = useState<string[]>([])

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
    if (page === 'comparative') {
      setSelectedComparativeGraphs([])
    }
  }

  const handleGraphToggle = (graphName: string) => {
    setSelectedGraphs(prev => 
      prev.includes(graphName)
        ? prev.filter(name => name !== graphName)
        : [...prev, graphName]
    )
  }

  const handleComparativeGraphToggle = (graphId: string) => {
    setSelectedComparativeGraphs(prev => 
      prev.includes(graphId)
        ? prev.filter(id => id !== graphId)
        : [...prev, graphId]
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

  const prepareChartData = (data: EconomicData[]) => {
    return data
      .filter(item => parseInt(item.Year) >= 1996)
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
      .sort((a, b) => {
        if (a["Minimum Wage (in R$)"] < b["Minimum Wage (in R$)"]) return -1;
        if (a["Minimum Wage (in R$)"] > b["Minimum Wage (in R$)"]) return 1;
        return 0;
      });
  }

  const renderComparativeGraphs = () => {
    const chartData = prepareChartData(economicData)

    const renderChart = (title: string, config: Record<string, { label: string; color: string }>, chartType: 'line' | 'scatter', xAxisMaxDomain?: number, yAxisDomain?: [number, number]) => {
      const dataKeys = Object.keys(config);
      if (dataKeys.length === 0) return null;

      const chartData = prepareChartData(economicData);

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
                    color: value?.color,
                  },
                ])
              )}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={dataKeys[0]} domain={xAxisMaxDomain ? [0, xAxisMaxDomain] : undefined} />
                    <YAxis dataKey={dataKeys[1]} domain={yAxisDomain} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {dataKeys.map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config[key]?.color}
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
                    <Scatter name={title} data={chartData} fill={config[dataKeys[0]]?.color} />
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-sm text-gray-500 mt-2">Note: Data shown from 1996 onwards due to outlier data in 1994 and 1995.</p>
          </CardContent>
        </Card>
      );
    };

    const graphs = [
      {
        id: "gdp-growth",
        component: renderChart("GDP Growth Rates", {
          "Year": { label: "Year", color: "hsl(0, 0%, 0%)" },
          "Growth rate from a Real GDP": { label: "Real GDP Growth", color: "hsl(0, 70%, 50%)" },
          "Growth rate from a Real GDP per capita": { label: "Real GDP per Capita Growth", color: "hsl(120, 70%, 50%)" }
        }, 'line')
      },
      {
        id: "inflation-wage",
        component: renderChart("Inflation Rate vs Minimum Wage Growth", {
          "Year": { label: "Year", color: "hsl(0, 0%, 0%)" },
          "IPCA Inflation Rate (% Annual Variation)": { label: "Inflation Rate", color: "hsl(240, 70%, 50%)" },
          "Minimum Wage Growth Rate percentage": { label: "Minimum Wage Growth", color: "hsl(60, 70%, 50%)" }
        }, 'line', undefined, [0, 20])
      },
      {
        id: "exchange-trade",
        component: renderChart("Exchange Rate vs Trade Balance Surplus Growth", {
          "Exchange Rate (January,R$/USD)": { label: "Exchange Rate", color:  "hsl(300, 70%, 50%)" },
          "Trade Balance Surplus Growth Rate": { label: "Trade Balance Surplus Growth", color: "hsl(180, 70%, 50%)" }
        }, 'line', 200)
      },
      {
        id: "fdi-gdp",
        component: renderChart("Foreign Direct Investment vs Nominal GDP", {
          "Nominal GDP (in Millions of R$)": { label: "Nominal GDP (Billions of R$)", color: "hsl(90, 70%, 50%)" },
          "Foreign Direct Investment (IED,in Billions of R$)": { label: "Foreign Direct Investment", color: "hsl(30, 70%, 50%)" }
        }, 'line')
      },
      {
        id: "unemployment-wage",
        component: renderChart("Unemployment Rate vs Minimum Wage", {
          "Minimum Wage (in R$)": { label: "Minimum Wage", color: "hsl(210, 70%, 50%)" },
          "Annual Average Unemployment Rate (%)": { label: "Unemployment Rate", color: "hsl(150, 70%, 50%)" }
        }, 'line')
      }
    ]

    return (
      <div className="space-y-8">
        {graphs.filter(graph => selectedComparativeGraphs.includes(graph.id)).map(graph => graph.component)}
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
          <CardHeader className="flex justify-between items-start">
            <div>
              {currentPage === 'home' ? <CardTitle>Economic Data Analysis</CardTitle> : <CardTitle>Filter and View Data</CardTitle>}
              {currentPage === 'home' ? <CardDescription>Explore and compare economic data</CardDescription> : <CardDescription>Select filters and data points to display</CardDescription>}
            </div>
            {currentPage !== 'home' && (
              <Button onClick={() => setCurrentPage('home')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:bg-black transition-colors duration-300">
                Back to Home
              </Button>
            )}
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
                <footer className="mt-8 text-center text-sm text-gray-500">
                  Data collection and Analysis by Isabella Carvalho<br />
                  Website by Sumanth Krishna for Research Fellowship at Avenues São Paulo
                </footer>
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
                <div className="flex flex-wrap gap-2 mb-4">
                  {comparativeGraphs.map(graph => (
                    <Button
                      key={graph.id}
                      variant={selectedComparativeGraphs.includes(graph.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleComparativeGraphToggle(graph.id)}
                      className="text-xs"
                    >
                      {graph.title}
                    </Button>
                  ))}
                </div>
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
        </Card>
      </div>
    </div>
  )
}
