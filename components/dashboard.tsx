'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface EconomicData {
  Presidents: string;
  Year: string;
  "Nominal GDP (in Billions of R$)": number;
  "Growth rate from a Real GDP": number;
  "Nominal GDP per Capita (in R$)": string;
  "GDP per capita growth (annual %)": string;
  "Exchange Rate (January, R$/USD)": number;
  "Exchange Rate (January, /R$USD) growth": number;
  "Foreign direct investment, net (BoP, current US$ in Billions)": number;
  "Portfolio investment, net (BoP, current US$ in Billions)": number;
  "Net Public sector debt as a % of Gross Domestic Product (GDP) in January": number;
  "Trade (% of GDP": string;
  "Net trade in goods and services (BoP, current US$ in Billions)": number;
  "Net trade in goods and services Growth Rate": number;
  "IPCA Inflation Rate (% Yearly Variation) on December": number;
  "Annual Average Unemployment Rate (%)": number;
  "January Nominal Minimum Wage (in R$)": string;
  "Selic Rate accumulated in the month of January": number | string;
}

const comparativeGraphs = [
  { title: "Growth rate from a Real GDP vs. IPCA Inflation Rate (% Yearly Variation) in December", id: "gdp-inflation" },
  { title: "Growth rate from a Real GDP vs. Annual Average Unemployment Rate (%)", id: "gdp-unemployment" },
  { title: "Growth rate from a Real GDP vs. Selic Rate accumulated in January", id: "gdp-selic" },
  { title: "IPCA Inflation Rate (% Yearly Variation) in December vs. Annual Average Unemployment Rate (%)", id: "inflation-unemployment" },
  { title: "Growth rate from a Real GDP vs. Net Public sector debt as a % of Gross Domestic Product (GDP)", id: "gdp-debt" },
  { title: "Net Public sector debt as a % of Gross Domestic Product (GDP) vs. Selic Rate accumulated in January", id: "debt-selic" },
  { title: "Selic Rate accumulated in January vs. IPCA Inflation Rate (% Yearly Variation)", id: "selic-inflation" },
  { title: "Selic Rate accumulated in January vs. Annual Average Unemployment Rate (%)", id: "selic-unemployment" },
  { title: "Exchange Rate (January, R$/USD) vs. Net trade in goods and services in Billions (BoP, current US$)", id: "exchange-trade" },
  { title: "Exchange Rate (January, R$/USD) vs. Portfolio investment, net in Billions (BoP, current US$)", id: "exchange-portfolio" },
  { title: "Exchange Rate (January, R$/USD) vs. IPCA Inflation Rate (% Yearly Variation) in December", id: "exchange-inflation" },
]

const dataPoints = [
  { name: "Growth rate from a Real GDP", id: "gdp-growth", unit: "%" },
  { name: "IPCA Inflation Rate (% Yearly Variation) on December", id: "inflation", unit: "%" },
  { name: "Annual Average Unemployment Rate (%)", id: "unemployment", unit: "%" },
  { name: "Selic Rate accumulated in the month of January", id: "selic-rate", unit: "%" },
  { name: "Net Public sector debt as a % of Gross Domestic Product (GDP) in January", id: "public-debt", unit: "% of GDP" },
  { name: "Exchange Rate (January, R$/USD)", id: "exchange-rate", unit: "R$/USD" },
  { name: "Net trade in goods and services (BoP, current US$ in Billions)", id: "trade-balance", unit: "Billions USD" },
  { name: "Portfolio investment, net (BoP, current US$ in Billions)", id: "portfolio-investment", unit: "Billions USD" },
  { name: "Foreign direct investment, net (BoP, current US$ in Billions)", id: "fdi", unit: "Billions USD" },
  { name: "GDP per capita growth (annual %)", id: "gdp-per-capita-growth", unit: "%" },
  { name: "January Nominal Minimum Wage (in R$)", id: "minimum-wage", unit: "R$" },
  { name: "Trade (% of GDP", id: "trade-gdp", unit: "%" },
  { name: "Nominal GDP (in Billions of R$)", id: "nominal-gdp", unit: "Billions R$" },
  { name: "Nominal GDP per Capita (in R$)", id: "nominal-gdp-per-capita", unit: "R$" },
  { name: "Exchange Rate (January, /R$USD) growth", id: "exchange-rate-growth", unit: "%" },
  { name: "Net trade in goods and services Growth Rate", id: "net-trade-growth", unit: "%" },
]

export default function EconomicDashboard() {
  const [economicData, setEconomicData] = useState<EconomicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<'home' | 'dataset' | 'comparative' | 'graphs'>('home')
  const [selectedComparativeGraphs, setSelectedComparativeGraphs] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedPresident, setSelectedPresident] = useState<string | null>(null)
  const [selectedDataPoints, setSelectedDataPoints] = useState<string[]>(dataPoints.map(dp => dp.id))
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dec5-CxYZR1YeKNcWrN5fWXVmrpNMOGtQwG.json')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data: EconomicData[] = await response.json()
        setEconomicData(data.filter(item => item.Year !== "" && item.Presidents !== "Sources"))
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error fetching data. Please try again later.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleHomeButtonClick = (page: 'dataset' | 'comparative' | 'graphs') => {
    setCurrentPage(page)
    if (page === 'comparative') {
      setSelectedComparativeGraphs([])
    }
    if (page === 'graphs') {
      setSelectedGraphs([])
    }
  }

  const handleComparativeGraphToggle = (graphId: string) => {
    setSelectedComparativeGraphs(prev => 
      prev.includes(graphId)
        ? prev.filter(id => id !== graphId)
        : [...prev, graphId]
    )
  }

  const handleDataPointToggle = (dataPointId: string) => {
    setSelectedDataPoints(prev => 
      prev.includes(dataPointId)
        ? prev.filter(id => id !== dataPointId)
        : [...prev, dataPointId]
    )
  }

  const handleGraphToggle = (graphId: string) => {
    setSelectedGraphs(prev => 
      prev.includes(graphId)
        ? prev.filter(id => id !== graphId)
        : [...prev, graphId]
    )
  }

  const renderComparativeGraphs = () => {
    const renderChart = (title: string, config: Record<string, { label: string; color: string; dataKey: string }>) => {
      const dataKeys = Object.keys(config);
      if (dataKeys.length === 0) return null;

      const hasGDPGrowth = dataKeys.some(key => config[key].dataKey === "Growth rate from a Real GDP");
      const hasExchangeRate = dataKeys.some(key => config[key].dataKey === "Exchange Rate (January, R$/USD)");

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
                    label: value.label,
                    color: value.color,
                  },
                ])
              )}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={economicData.filter(item => parseInt(item.Year) >= 1996)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Year" />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    domain={hasGDPGrowth ? [-10, 'auto'] : ['auto', 'auto']}
                  />
                  {hasExchangeRate && <YAxis yAxisId="right" orientation="right" />}
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {dataKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={config[key].dataKey}
                      stroke={config[key].color}
                      name={config[key].label}
                      yAxisId={hasExchangeRate && index === 1 ? "right" : "left"}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      );
    };

    const graphs = [
      {
        id: "gdp-inflation",
        component: renderChart("Growth rate from a Real GDP vs. IPCA Inflation Rate (% Yearly Variation) in December", {
          "gdp": { label: "GDP Growth (%)", color: "hsl(120, 70%, 50%)", dataKey: "Growth rate from a Real GDP" },
          "inflation": { label: "Inflation Rate (%)", color: "hsl(0, 70%, 50%)", dataKey: "IPCA Inflation Rate (% Yearly Variation) on December" }
        })
      },
      {
        id: "gdp-unemployment",
        component: renderChart("Growth rate from a Real GDP vs. Annual Average Unemployment Rate (%)", {
          "gdp": { label: "GDP Growth (%)", color: "hsl(120, 70%, 50%)", dataKey: "Growth rate from a Real GDP" },
          "unemployment": { label: "Unemployment Rate (%)", color: "hsl(30, 70%, 50%)", dataKey: "Annual Average Unemployment Rate (%)" }
        })
      },
      {
        id: "gdp-selic",
        component: renderChart("Growth rate from a Real GDP vs. Selic Rate accumulated in January", {
          "gdp": { label: "GDP Growth (%)", color: "hsl(120, 70%, 50%)", dataKey: "Growth rate from a Real GDP" },
          "selic": { label: "Selic Rate (%)", color: "hsl(270, 70%, 50%)", dataKey: "Selic Rate accumulated in the month of January" }
        })
      },
      {
        id: "inflation-unemployment",
        component: renderChart("IPCA Inflation Rate (% Yearly Variation) in December vs. Annual Average Unemployment Rate (%)", {
          "inflation": { label: "Inflation Rate (%)", color: "hsl(0, 70%, 50%)", dataKey: "IPCA Inflation Rate (% Yearly Variation) on December" },
          "unemployment": { label: "Unemployment Rate (%)", color: "hsl(30, 70%, 50%)", dataKey: "Annual Average Unemployment Rate (%)" }
        })
      },
      {
        id: "gdp-debt",
        component: renderChart("Growth rate from a Real GDP vs. Net Public sector debt as a % of Gross Domestic Product (GDP)", {
          "gdp": { label: "GDP Growth (%)", color: "hsl(120, 70%, 50%)", dataKey: "Growth rate from a Real GDP" },
          "debt": { label: "Public Debt (% of GDP)", color: "hsl(150, 70%, 50%)", dataKey: "Net Public sector debt as a % of Gross Domestic Product (GDP) in January" }
        })
      },
      {
        id: "debt-selic",
        component: renderChart("Net Public sector debt as a % of Gross Domestic Product (GDP) vs. Selic Rate accumulated in January", {
          "debt": { label: "Public Debt (% of GDP)", color: "hsl(150, 70%, 50%)", dataKey: "Net Public sector debt as a % of Gross Domestic Product (GDP) in January" },
          "selic": { label: "Selic Rate (%)", color: "hsl(270, 70%, 50%)", dataKey: "Selic Rate accumulated in the month of January" }
        })
      },
      {
        id: "selic-inflation",
        component: renderChart("Selic Rate accumulated in January vs. IPCA Inflation Rate (% Yearly Variation)", {
          "selic": { label: "Selic Rate (%)", color: "hsl(270, 70%, 50%)", dataKey: "Selic Rate accumulated in the month of January" },
          "inflation": { label: "Inflation Rate (%)", color: "hsl(0, 70%, 50%)", dataKey: "IPCA Inflation Rate (% Yearly Variation) on December" }
        })
      },
      {
        id: "selic-unemployment",
        component: renderChart("Selic Rate accumulated in January vs. Annual Average Unemployment Rate (%)", {
          "selic": { label: "Selic Rate (%)", color: "hsl(270, 70%, 50%)", dataKey: "Selic Rate accumulated in the month of January" },
          "unemployment": { label: "Unemployment Rate (%)", color: "hsl(30, 70%, 50%)", dataKey: "Annual Average Unemployment Rate (%)" }
        })
      },
      {
        id: "exchange-trade",
        component: renderChart("Exchange Rate (January, R$/USD) vs. Net trade in goods and services in Billions (BoP, current US$)", {
          "exchange": { label: "Exchange Rate (R$/USD)", color: "hsl(240, 70%, 50%)", dataKey: "Exchange Rate (January, R$/USD)" },
          "trade": { label: "Trade Balance (Billions USD)", color: "hsl(60, 70%, 50%)", dataKey: "Net trade in goods and services (BoP, current US$ in Billions)" }
        })
      },
      {
        id: "exchange-portfolio",
        component: renderChart("Exchange Rate (January, R$/USD) vs. Portfolio investment, net in Billions (BoP, current US$)", {
          "exchange": { label: "Exchange Rate (R$/USD)", color: "hsl(240, 70%, 50%)", dataKey: "Exchange Rate (January, R$/USD)" },
          "portfolio": { label: "Portfolio Investment (Billions USD)", color: "hsl(180, 70%, 50%)", dataKey: "Portfolio investment, net (BoP, current US$ in Billions)" }
        })
      },
      {
        id: "exchange-inflation",
        component: renderChart("Exchange Rate (January, R$/USD) vs. IPCA Inflation Rate (% Yearly Variation) in December", {
          "exchange": { label: "Exchange Rate (R$/USD)", color: "hsl(240, 70%, 50%)", dataKey: "Exchange Rate (January, R$/USD)" },
          "inflation": { label: "Inflation Rate (%)", color: "hsl(0, 70%, 50%)", dataKey: "IPCA Inflation Rate (% Yearly Variation) on December" }
        })
      }
    ]

    return (
      <div className="space-y-8">
        {graphs.filter(graph => selectedComparativeGraphs.includes(graph.id)).map(graph => graph.component)}
      </div>
    )
  }

  const renderDataset = () => {
    const years = Array.from(new Set(economicData.map(item => item.Year))).sort((a, b) => parseInt(b) - parseInt(a))
    const presidents = Array.from(new Set(economicData.map(item => item.Presidents)))

    const filteredData = economicData.filter(item => {
      const yearMatch = !selectedYear || selectedYear === 'all' || item.Year === selectedYear
      const presidentMatch = !selectedPresident || selectedPresident === 'all' || item.Presidents === selectedPresident
      return yearMatch && presidentMatch
    })

    return (
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
                <SelectItem key={president} value={president}>{president}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {dataPoints.map(dataPoint => (
            <Button
              key={dataPoint.id}
              variant={selectedDataPoints.includes(dataPoint.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleDataPointToggle(dataPoint.id)}
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
                  {selectedDataPoints.map(dataPointId => {
                    const dataPoint = dataPoints.find(dp => dp.id === dataPointId)
                    return (
                      <th key={dataPointId} className="border border-gray-300 p-2">
                        {dataPoint?.name} ({dataPoint?.unit})
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2">{item.Year}</td>
                    <td className="border border-gray-300 p-2">{item.Presidents}</td>
                    {selectedDataPoints.map(dataPointId => {
                      const dataPoint = dataPoints.find(dp => dp.id === dataPointId)
                      let value = item[dataPoint?.name as keyof EconomicData]
                      
                      // Format the value based on the data type
                      if (typeof value === 'number') {
                        if (dataPoint?.unit === '%') {
                          value = value.toFixed(2) + '%'
                        } else if (dataPoint?.unit.includes('Billions')) {
                          value = value.toFixed(3)
                        } else {
                          value = value.toLocaleString('en-US', { maximumFractionDigits: 2 })
                        }
                      }
                      
                      return (
                        <td key={dataPointId} className="border border-gray-300 p-2">
                          {value?.toString() || 'N/A'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available. Please adjust your filters or check the data source.</p>
          )}
        </div>
      </div>
    )
  }

  const renderGraphs = () => {
    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Economic Data Graphs</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {dataPoints.map(dataPoint => (
            <Button
              key={dataPoint.id}
              variant={selectedGraphs.includes(dataPoint.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleGraphToggle(dataPoint.id)}
              className="text-xs"
            >
              {dataPoint.name}
            </Button>
          ))}
        </div>
        {selectedGraphs.length === 0 && (
          <p>Please select one or more graphs to display.</p>
        )}
        {selectedGraphs.map((graphId, index) => {
          const dataPoint = dataPoints.find(dp => dp.id === graphId)
          if (!dataPoint) return null
          return (
            <Card key={graphId}>
              <CardHeader>
                <CardTitle>{dataPoint.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    [dataPoint.id]: {
                      label: `${dataPoint.name} (${dataPoint.unit})`,
                      color: `hsl(${(index * 30) % 360}, 70%, 50%)`,
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={economicData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Year" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey={dataPoint.name}
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
          )
        })}
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
      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 shadow-md">
        <h1 className="text-3xl font-bold text-white text-center">Brazilian Economic Data Dashboard (1994-2022)</h1>
      </div>
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader className="flex justify-between items-start">
            <div>
              {currentPage === 'home' ? <CardTitle>Economic Data Analysis</CardTitle> : <CardTitle>Filter and View Data</CardTitle>}
              {currentPage === 'home' ? <CardDescription>Explore and compare economic data</CardDescription> : <CardDescription>Select filters and data points to display</CardDescription>}
            </div>
            {currentPage !== 'home' && (
              <Button onClick={() => setCurrentPage('home')} className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-none hover:bg-black transition-colors duration-300">
                Back to Home
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {currentPage === 'home' && (
              <div className="space-y-4">
                <Button 
                  onClick={() => handleHomeButtonClick('dataset')}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white border-none hover:bg-black transition-colors duration-300"
                >
                  View Dataset
                </Button>
                <Button 
                  onClick={() => handleHomeButtonClick('comparative')}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white border-none hover:bg-black transition-colors duration-300"
                >
                  View Comparative Data
                </Button>
                <Button 
                  onClick={() => handleHomeButtonClick('graphs')}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white border-none hover:bg-black transition-colors duration-300"
                >
                  View Graphs
                </Button>
                <footer className="mt-8 text-center text-sm text-gray-500">
                  Data collection and Analysis by Isabella Carvalho
                </footer>
              </div>
            )}
            {currentPage === 'dataset' && renderDataset()}
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
            {currentPage === 'graphs' && renderGraphs()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
