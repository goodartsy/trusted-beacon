import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface Impression {
  slotId: string;
  campaignId: string;
  creativeId?: string;
  pageUrl: string;
  viewportShare: number;
  timeInView: number;
  userInteraction: boolean;
  clickCount: number;
  hoverDuration: number;
  userAgent: string;
  timestamp: string;
  hash: string;
  verified: boolean;
}

export default function TrustedAdBeaconDashboard() {
  const [impressions, setImpressions] = useState<Impression[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL; // Base API URL from env

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      fetch(`${apiUrl}/impressions`)
        .then(res => res.json())
        .then((data: Impression[]) => setImpressions(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const handleAudit = (hash: string) => {
    fetch(`${apiUrl}/audit/${hash}`)
      .then(res => res.json())
      .then(info => {
        alert(`Audit: valid=${info.valid}, txHash=${info.txHash}`);
      })
      .catch(() => alert('Audit fehlgeschlagen'));
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Gesamtzahl */}
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle>Total Impressions: {impressions.length}</CardTitle>
        </CardHeader>
      </Card>

      {/* Impression-Log */}
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle>Impression Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Lädt...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Slot ID</th>
                    <th className="px-4 py-2">Campaign ID</th>
                    <th className="px-4 py-2">Page URL</th>
                    <th className="px-4 py-2">Viewport %</th>
                    <th className="px-4 py-2">Time In View (ms)</th>
                    <th className="px-4 py-2">Interacted</th>
                    <th className="px-4 py-2">Click Count</th>
                    <th className="px-4 py-2">Hover Duration (ms)</th>
                    <th className="px-4 py-2">Timestamp</th>
                    <th className="px-4 py-2">Verified</th>
                    <th className="px-4 py-2">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {impressions.map((imp, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <td className="px-4 py-2">{imp.slotId}</td>
                      <td className="px-4 py-2">{imp.campaignId}</td>
                      <td className="px-4 py-2">
                        <a href={imp.pageUrl} target="_blank" rel="noopener noreferrer">
                          {new URL(imp.pageUrl).hostname}
                        </a>
                      </td>
                      <td className="px-4 py-2">{(imp.viewportShare * 100).toFixed(0)}%</td>
                      <td className="px-4 py-2">{imp.timeInView}</td>
                      <td className="px-4 py-2">{imp.userInteraction ? '✅' : '❌'}</td>
                      <td className="px-4 py-2">{imp.clickCount}</td>
                      <td className="px-4 py-2">{imp.hoverDuration}</td>
                      <td className="px-4 py-2">{new Date(imp.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2">{imp.verified ? '✅' : '❌'}</td>
                      <td className="px-4 py-2">
                        <Button size="sm" onClick={() => handleAudit(imp.hash)}>
                          Audit
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
