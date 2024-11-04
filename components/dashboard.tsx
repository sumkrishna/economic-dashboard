'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface EconomicData {
  Presidents: string;
  Year: string;
  "Nominal GDP (in Millions of R$)": string;
  "Growth rate from a Real GDP": string;
  "Nominal GDP per Capita (in R$)": string;
  "Growth rate from a Real GDP per capita": string;
  "Exchange Rate (January,R$/USD)": number;
  "Exchange Rate (January,/R$USD) growth": string;
  "Foreign Direct Investment (IED,in Billions of R$)": string;
  "Foreign Portfolio Investment (USD millions) in the 4th quarter": number;
  "Trade Balance Surplus Growth Rate": string;
  "IPCA Inflation Rate (% Annual Variation)": number;
  "Annual Average Unemployment Rate (%)": string;
  "Minimum Wage (in R$)": string;
  "Minimum Wage Growth Rate percentage": string;
  "Yearly Cost of Living Index (ICV)(Avg. % Change)": string;
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
];

export default function EconomicDashboard() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedPresident, setSelectedPresident] = useState<string | null>(null);
  const [selectedDataPoints, setSelectedDataPoints] = useState<DataPoint[]>(dataPoints);
  const [economicData, setEconomicData] = useState<EconomicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'dataset' | 'comparative' | 'graphs'>('home');
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://your-csv-url.com');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setEconomicData(parsedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseCSV = (csvText: string): EconomicData[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj: any, header, index) => {
        let value = values[index]?.trim() || '';
        if (header === "Exchange Rate (January,R$/USD)" ||
            header === "Foreign Portfolio Investment (USD millions) in the 4th quarter" ||
            header === "IPCA Inflation Rate (% Annual Variation)") {
          obj[header.trim()] = parseFloat(value) || 0;
        } else if (header === "Exchange Rate (January,/R$USD) growth" ||
                   header === "Foreign Direct Investment (IED,in Billions of R$)" ||
                   header === "Minimum Wage (in R$)" ||
                   header === "Minimum Wage Growth Rate percentage" ||
                   header === "Yearly Cost of Living Index (ICV)(Avg. % Change)") {
          obj[header.trim()] = parseFloat(value.replace(',', '.')) || 0;
        } else {
          obj[header.trim()] = value;
        }
        return obj;
      }, {}) as EconomicData;
    }).filter(item => item.Year && item.Presidents);
  };

  const handleDataPointToggle = (dataPoint: DataPoint) => {
    setSelectedDataPoints(prev =>
      prev.some(dp => dp.name === dataPoint.name)
        ? prev.filter(dp => dp.name !== dataPoint.name)
        : [...prev, dataPoint].sort((a, b) => a.index - b.index)
    );
  };

  const handleHomeButtonClick = (page: 'dataset' | 'comparative' | 'graphs') => {
    setCurrentPage(page);
    if (page === 'dataset') {
      setSelectedDataPoints(dataPoints);
    }
    if (page === 'graphs') {
      setSelectedGraphs([]);
    }
  };

  const handleGraphToggle = (graphName: string) => {
    setSelectedGraphs(prev =>
      prev.includes(graphName)
        ? prev.filter(name => name !== graphName)
        : [...prev, graphName]
    );
  };

  const years = Array.from(new Set(economicData.map(item => item.Year))).sort((a, b) => parseInt(b) - parseInt(a));
  const presidents = Array.from(new Set(economicData.map(item => item.Presidents)));

  const filteredData = economicData.filter(item => {
    const yearMatch = !selectedYear || selectedYear === 'all' || item.Year === selectedYear;
    const presidentMatch = !selectedPresident || selectedPresident === 'all' || item.Presidents === selectedPresident;
    return yearMatch && presidentMatch;
  });

  const prepareChartData = (data: EconomicData[]) => {
    return data.map(item => ({
      ...item,
      "Nominal GDP (in Millions of R$)": parseFloat(item["Nominal GDP (in Millions of R$)"]?.replace(/\s/g, '').replace(',', '.') || '0') / 1000, // Convert to billions
      "Growth rate from a Real GDP": parseFloat(item["Growth rate from a Real GDP"]?.replace(',', '.') || '0'),
      "Nominal GDP per Capita (in R$)": parseFloat(item["Nominal GDP per Capita (in R$)"]?.replace(/\s/g, '').replace(',', '.') || '0'),
      "Growth rate from a Real GDP per capita": parseFloat(item["Growth rate from a Real GDP per capita"]?.replace(',', '.') || '0'),
      "Exchange Rate (January,R$/USD)": item["Exchange Rate (January,R$/USD)"],
      "Exchange Rate (January,/R$USD) growth": parseFloat(item["Exchange Rate (January,/R$USD) growth"]?.toString() || '0'),
      "Foreign Direct Investment (IED,in Billions of R$)": parseFloat(item["Foreign Direct Investment (IED,in Billions of R$)"]?.toString() || '0'),
      "Foreign Portfolio Investment (USD millions) in the 4th quarter": item["Foreign Portfolio Investment (USD millions) in the 4th quarter"],
      "Trade Balance Surplus Growth Rate": parseFloat(item["Trade Balance Surplus Growth Rate"]?.replace(',', '.') || '0'),
      "IPCA Inflation Rate (% Annual Variation)": item["IPCA Inflation Rate (% Annual Variation)"],
      "Annual Average Unemployment Rate (%)": parseFloat(item["Annual Average Unemployment Rate (%)"]?.replace(',', '.') || '0'),
      "Minimum Wage (in R$)": parseFloat(item["Minimum Wage (in R$)"]?.toString() || '0'),
      "Minimum Wage Growth Rate percentage": parseFloat(item["Minimum Wage Growth Rate percentage"]?.toString() || '0'),
      "Yearly Cost of Living Index (ICV)(Avg. % Change)": parseFloat(item["Yearly Cost of Living Index (ICV)(Avg. % Change)"]?.toString() || '0')
    }));
  };

  const renderComparativeGraphs = () => {
    const chartData = prepareChartData(economicData);

    const renderChart = (title: string, key: keyof EconomicData) => (
      <div key={key as string} style={{ margin: '2rem 0' }}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Year" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey={key} stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );

    return selectedGraphs.map(name => renderChart(name, name as keyof EconomicData));
  };

  if (loading) return <Loader2 size="48" />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Button onClick={() => handleHomeButtonClick('dataset')}>Dataset View</Button>
      <Button onClick={() => handleHomeButtonClick('comparative')}>Comparative View</Button>
      <Button onClick={() => handleHomeButtonClick('graphs')}>Graphs View</Button>
      {renderComparativeGraphs()}
    </div>
  );
}
