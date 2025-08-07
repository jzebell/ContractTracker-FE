import React, { useState, useEffect } from 'react';
import { ContractBurnRate } from '../../types/ContractResource.types';
import { contractResourceService } from '../../services/contractResourceService';
import './BurnRateDashboard.css';

interface BurnRateDashboardProps {
  contractId: string;
}

const BurnRateDashboard: React.FC<BurnRateDashboardProps> = ({ contractId }) => {
  const [burnRate, setBurnRate] = useState<ContractBurnRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBurnRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  const loadBurnRate = async () => {
    try {
      setLoading(true);
      const data = await contractResourceService.getContractBurnRate(contractId);
      setBurnRate(data);
      setError(null);
    } catch (err) {
      setError('Failed to load burn rate data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFundingWarningColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const getFundingWarningEmoji = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '🟢';
    }
  };

  if (loading) return <div className="dashboard-loading">Loading burn rate analysis...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!burnRate) return null;

  const fundingRemaining = burnRate.fundedValue - (burnRate.actualBurnedAmount || 0);
  const monthlyDelta = burnRate.actualMonthlyBurn - burnRate.estimatedMonthlyBurn;
  const isOverBurning = monthlyDelta > 0;

  return (
    <div className="burn-rate-dashboard">
      <div className="dashboard-header">
        <h3>📊 Burn Rate Analysis</h3>
        <span className="funding-status" style={{ color: getFundingWarningColor(burnRate.fundingWarningLevel) }}>
          {getFundingWarningEmoji(burnRate.fundingWarningLevel)} {burnRate.fundingWarningLevel}
        </span>
      </div>

      <div className="metrics-grid">
        {/* Funding Overview */}
        <div className="metric-card">
          <div className="metric-label">Total Contract Value</div>
          <div className="metric-value">${burnRate.totalValue.toLocaleString()}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Funded Amount</div>
          <div className="metric-value">${burnRate.fundedValue.toLocaleString()}</div>
          <div className="metric-subtext">{((burnRate.fundedValue / burnRate.totalValue) * 100).toFixed(1)}% of total</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Burned to Date</div>
          <div className="metric-value">${(burnRate.actualBurnedAmount || 0).toLocaleString()}</div>
          <div className="metric-subtext">{burnRate.fundingPercentageUsed.toFixed(1)}% used</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Funding Remaining</div>
          <div className="metric-value" style={{ color: fundingRemaining < 0 ? '#dc2626' : '#10b981' }}>
            ${fundingRemaining.toLocaleString()}
          </div>
          <div className="metric-subtext">
            {burnRate.monthsUntilDepletion ? `${burnRate.monthsUntilDepletion} months left` : 'Calculate burn first'}
          </div>
        </div>
      </div>

      {/* Burn Rate Comparison */}
      <div className="burn-rate-comparison">
        <h4>Monthly Burn Rate</h4>
        <div className="burn-bars">
          <div className="burn-bar">
            <div className="bar-label">Estimated</div>
            <div className="bar-container">
              <div 
                className="bar-fill estimated"
                style={{ width: `${(burnRate.estimatedMonthlyBurn / Math.max(burnRate.estimatedMonthlyBurn, burnRate.actualMonthlyBurn)) * 100}%` }}
              />
              <span className="bar-value">${burnRate.estimatedMonthlyBurn.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="burn-bar">
            <div className="bar-label">Actual</div>
            <div className="bar-container">
              <div 
                className="bar-fill actual"
                style={{ 
                  width: `${(burnRate.actualMonthlyBurn / Math.max(burnRate.estimatedMonthlyBurn, burnRate.actualMonthlyBurn)) * 100}%`,
                  backgroundColor: isOverBurning ? '#dc2626' : '#10b981'
                }}
              />
              <span className="bar-value">${burnRate.actualMonthlyBurn.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {monthlyDelta !== 0 && (
          <div className={`burn-delta ${isOverBurning ? 'over' : 'under'}`}>
            {isOverBurning ? '⚠️ Over-burning by ' : '✅ Under-burning by '}
            ${Math.abs(monthlyDelta).toLocaleString()}/month
          </div>
        )}
      </div>

      {/* Resource Summary */}
      <div className="resource-summary">
        <h4>Resource Allocation</h4>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{burnRate.assignedResourceCount}</span>
            <span className="stat-label">Resources Assigned</span>
          </div>
          <div className="stat">
            <span className="stat-value">${burnRate.actualAnnualBurn.toLocaleString()}</span>
            <span className="stat-label">Annual Burn Rate</span>
          </div>
          {burnRate.projectedDepletionDate && (
            <div className="stat">
              <span className="stat-value">
                {new Date(burnRate.projectedDepletionDate).toLocaleDateString()}
              </span>
              <span className="stat-label">Projected Depletion</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BurnRateDashboard;