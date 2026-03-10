import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  id: string;
  token: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  createdAt: Date;
}

interface PriceAlertsProps {
  alerts: Alert[];
  onCreateAlert: (alert: Omit<Alert, 'id' | 'triggered' | 'createdAt'>) => void;
  onDeleteAlert: (id: string) => void;
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({
  alerts,
  onCreateAlert,
  onDeleteAlert,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    token: '',
    symbol: '',
    condition: 'above' as const,
    targetPrice: 0,
    currentPrice: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAlert(newAlert);
    setShowForm(false);
    setNewAlert({
      token: '',
      symbol: '',
      condition: 'above',
      targetPrice: 0,
      currentPrice: 0,
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🔔 Price Alerts
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          + New Alert
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-gray-700/50 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Token address"
                value={newAlert.token}
                onChange={(e) => setNewAlert({ ...newAlert, token: e.target.value })}
                className="px-3 py-2 bg-gray-800 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="Symbol (e.g., SOL)"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                className="px-3 py-2 bg-gray-800 rounded-lg text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                className="px-3 py-2 bg-gray-800 rounded-lg text-white text-sm"
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
              <input
                type="number"
                placeholder="Target price"
                value={newAlert.targetPrice || ''}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: parseFloat(e.target.value) })}
                className="px-3 py-2 bg-gray-800 rounded-lg text-white text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
            >
              Create Alert
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No alerts set</p>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg flex items-center justify-between ${
                alert.triggered ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700/50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{alert.symbol}</span>
                  <span className={`text-sm ${alert.condition === 'above' ? 'text-green-400' : 'text-red-400'}`}>
                    {alert.condition === 'above' ? '📈' : '📉'} {alert.condition} ${alert.targetPrice}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Current: ${alert.currentPrice.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => onDeleteAlert(alert.id)}
                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
              >
                🗑️
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceAlerts;
