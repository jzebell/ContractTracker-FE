import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import dashboardService from '../../services/dashboardService';
import {
  DashboardMetrics,
  ContractHealthCard,
  ResourceUtilizationMetrics,
  AlertNotification,
  FinancialProjections,
  formatCurrency,
  formatPercentage,
  getHealthColor,
  getWarningIcon,
  getTrendIcon,
  getSeverityColor
} from '../../types/Dashboard.types';

const FinancialDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [contracts, setContracts] = useState<ContractHealthCard[]>([]);
  const [resources, setResources] = useState<ResourceUtilizationMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [projections, setProjections] = useState<FinancialProjections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'contracts' | 'resources' | 'projections'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadDashboard();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getCompleteDashboard();
      setMetrics(data.metrics);
      setContracts(data.contracts);
      setResources(data.resources);
      setAlerts(data.alerts);
      
      // Load projections separately
      const proj = await dashboardService.getProjections(12);
      setProjections(proj);
      
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <button onClick={loadDashboard} className="ml-4 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time portfolio analytics and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 border-b">
          {(['overview', 'contracts', 'resources', 'projections'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 font-medium capitalize ${
                selectedView === view
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-red-600 mb-3">⚠️ Critical Alerts</h3>
          <div className="space-y-2">
            {alerts
              .filter(a => a.severity === 'Critical' || a.severity === 'High')
              .slice(0, 5)
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {selectedView === 'overview' && metrics && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Contract Value"
              value={formatCurrency(metrics.totalContractValue)}
              subtitle={`Funded: ${formatCurrency(metrics.totalFundedValue)}`}
              trend={metrics.totalFundedValue / metrics.totalContractValue * 100}
            />
            <MetricCard
              title="Monthly Burn Rate"
              value={formatCurrency(metrics.monthlyBurnRate)}
              subtitle={`Quarterly: ${formatCurrency(metrics.quarterlyBurnRate)}`}
              trend={-1}
            />
            <MetricCard
              title="Portfolio Health"
              value={metrics.overallHealth}
              subtitle={`${metrics.activeContracts} active contracts`}
              customColor={getHealthColor(metrics.overallHealth)}
            />
            <MetricCard
              title="Monthly Profit"
              value={formatCurrency(metrics.projectedMonthlyProfit)}
              subtitle={`Revenue: ${formatCurrency(metrics.projectedMonthlyRevenue)}`}
              trend={metrics.projectedMonthlyProfit > 0 ? 1 : -1}
            />
          </div>

          {/* Portfolio Composition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: metrics.activeContracts, color: '#10B981' },
                      { name: 'Draft', value: metrics.draftContracts, color: '#3B82F6' },
                      { name: 'Closed', value: metrics.closedContracts, color: '#6B7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Active', value: metrics.activeContracts, color: '#10B981' },
                      { name: 'Draft', value: metrics.draftContracts, color: '#3B82F6' },
                      { name: 'Closed', value: metrics.closedContracts, color: '#6B7280' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Warning Levels</h3>
              <div className="space-y-3">
                <WarningBar
                  label="Critical"
                  count={metrics.criticalContracts}
                  total={metrics.activeContracts}
                  color="bg-red-500"
                />
                <WarningBar
                  label="High Warning"
                  count={metrics.warningContracts}
                  total={metrics.activeContracts}
                  color="bg-orange-500"
                />
                <WarningBar
                  label="Healthy"
                  count={metrics.activeContracts - metrics.criticalContracts - metrics.warningContracts}
                  total={metrics.activeContracts}
                  color="bg-green-500"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contracts Tab */}
      {selectedView === 'contracts' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contract Health Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map((contract) => (
                <ContractHealthCardComponent key={contract.contractId} contract={contract} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {selectedView === 'resources' && resources && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Resources"
              value={resources.totalResources.toString()}
              subtitle={`Active: ${resources.activeResources}`}
            />
            <MetricCard
              title="Average Utilization"
              value={formatPercentage(resources.averageUtilization)}
              subtitle={`Bench: ${resources.benchResources}`}
            />
            <MetricCard
              title="Underwater Resources"
              value={resources.underwaterResources.toString()}
              subtitle="Negative margin"
              trend={resources.underwaterResources > 0 ? -1 : 1}
            />
            <MetricCard
              title="Monthly Margin"
              value={formatCurrency(resources.totalMonthlyRevenue - resources.totalMonthlyCost)}
              subtitle={formatPercentage((resources.totalMonthlyRevenue - resources.totalMonthlyCost) / resources.totalMonthlyRevenue * 100)}
              trend={resources.totalMonthlyRevenue > resources.totalMonthlyCost ? 1 : -1}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Utilized Resources</h3>
              <div className="space-y-2">
                {resources.topUtilizedResources.map((resource) => (
                  <div key={resource.resourceId} className="flex justify-between items-center p-2 hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{resource.resourceName}</div>
                      <div className="text-sm text-gray-600">{resource.lcatTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPercentage(resource.totalAllocation)}</div>
                      <div className="text-sm text-gray-600">{resource.contractCount} contracts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Underutilized Resources</h3>
              <div className="space-y-2">
                {resources.underutilizedResources.map((resource) => (
                  <div key={resource.resourceId} className="flex justify-between items-center p-2 hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{resource.resourceName}</div>
                      <div className="text-sm text-gray-600">{resource.lcatTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">{formatPercentage(resource.totalAllocation)}</div>
                      <div className="text-sm text-gray-600">
                        {resource.isUnderwater && '⚠️ Underwater'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Type Breakdown */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Resource Metrics by Type</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Revenue</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Margin</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(resources.metricsByType || {}).map(([type, metrics]) => (
                      <tr key={type} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{type}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-500">{metrics.count}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-500">{formatCurrency(metrics.averageCost)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-500">{formatCurrency(metrics.averageRevenue)}</td>
                        <td className={`px-4 py-2 text-sm text-right font-medium ${metrics.averageMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(metrics.averageMargin)}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-500">{formatPercentage(metrics.utilizationPercentage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Projections Tab */}
      {selectedView === 'projections' && projections && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">12-Month Financial Projections</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={projections.projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value: any) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis tickFormatter={(value: any) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label: any) => new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
                <Legend />
                <Area type="monotone" dataKey="projectedRevenue" stackId="1" stroke="#10B981" fill="#10B981" name="Revenue" />
                <Area type="monotone" dataKey="projectedCost" stackId="2" stroke="#EF4444" fill="#EF4444" name="Cost" />
                <Line type="monotone" dataKey="projectedProfit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Depletion Schedule</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projections.depletionSchedule.length > 0 ? (
                  projections.depletionSchedule.slice(0, 10).map((depletion) => (
                    <div key={depletion.contractId} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="font-medium">{depletion.contractNumber}</div>
                      <div className="text-sm text-gray-600">
                        Depletes in {depletion.daysUntilDepletion} days • {formatCurrency(depletion.remainingFunds)} remaining
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        Impact: {depletion.impactSeverity}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No contracts at risk of depletion</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Projection Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-green-600">{formatCurrency(projections.totalProjectedRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-semibold text-red-600">{formatCurrency(projections.totalProjectedCost)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-900 font-medium">Total Profit</span>
                  <span className={`font-bold ${projections.totalProjectedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(projections.totalProjectedProfit)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2">Monthly Breakdown</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {projections.projections.map((month) => (
                      <div key={month.month} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className={month.projectedProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(month.projectedProfit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expiring Contracts Alert */}
          {projections.projections.some(p => p.expiringContracts.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">📅 Upcoming Contract Expirations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {projections.projections
                  .filter(p => p.expiringContracts.length > 0)
                  .map((month) => (
                    <div key={month.month} className="bg-white rounded p-3">
                      <div className="font-medium text-sm">
                        {new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {month.expiringContracts.join(', ')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Sub-components
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  customColor?: string;
}> = ({ title, value, subtitle, trend, customColor }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-semibold mt-1 ${customColor ? customColor.split(' ')[0] : 'text-gray-900'}`}>
          {value}
        </p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {trend !== undefined && (
        <div className={`text-2xl ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'}
        </div>
      )}
    </div>
  </div>
);

const WarningBar: React.FC<{
  label: string;
  count: number;
  total: number;
  color: string;
}> = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const ContractHealthCardComponent: React.FC<{ contract: ContractHealthCard }> = ({ contract }) => (
  <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold">{contract.contractNumber}</h4>
        <p className="text-sm text-gray-600">{contract.customerName}</p>
      </div>
      <div className="flex items-center space-x-1">
        <span>{getWarningIcon(contract.warningLevel)}</span>
        <span>{getTrendIcon(contract.trend)}</span>
      </div>
    </div>
    
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Funded</span>
        <span>{formatCurrency(contract.fundedValue)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Burn Rate</span>
        <span>{formatCurrency(contract.monthlyBurnRate)}/mo</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Depletion</span>
        <span className={contract.monthsUntilDepletion <= 3 ? 'text-red-600 font-semibold' : ''}>
          {contract.monthsUntilDepletion > 0 ? `${contract.monthsUntilDepletion} months` : 'Depleted'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Resources</span>
        <span>{contract.resourceCount} @ {formatPercentage(contract.resourceUtilization)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Margin</span>
        <span className={contract.profitMargin < 10 ? 'text-orange-600' : 'text-green-600'}>
          {formatPercentage(contract.profitMargin)}
        </span>
      </div>
    </div>

    {contract.alerts.length > 0 && (
      <div className="mt-3 pt-3 border-t">
        {contract.alerts.slice(0, 2).map((alert, index) => (
          <div key={index} className="text-xs text-gray-600 mt-1">{alert}</div>
        ))}
      </div>
    )}
  </div>
);

export default FinancialDashboard;