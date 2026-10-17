import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Tabs } from '../components/common/Tabs';
import { Slider } from '../components/common/Slider';
import { LoadBalancerLab } from '../features/labs/simulators/LoadBalancerLab';
import { RateLimiterLab } from '../features/labs/simulators/RateLimiterLab';
import { AppProvider } from '../context/AppContext';

describe('Common UI Components', () => {
  describe('Button', () => {
    it('renders text and responds to click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Run Simulation</Button>);
      
      const btn = screen.getByRole('button', { name: /run simulation/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when disabled prop is passed', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled Action</Button>);

      const btn = screen.getByRole('button', { name: /disabled action/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Badge', () => {
    it('renders with correct text and variant styles', () => {
      render(<Badge variant="success">Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Card', () => {
    it('renders card children and title', () => {
      render(
        <Card>
          <h3>System Performance</h3>
          <p>Latency is 12ms</p>
        </Card>
      );
      expect(screen.getByText('System Performance')).toBeInTheDocument();
      expect(screen.getByText('Latency is 12ms')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('switches active tab on click', () => {
      const handleTabChange = vi.fn();
      render(
        <Tabs
          tabs={[
            { id: 'tab1', label: 'Overview' },
            { id: 'tab2', label: 'Architecture' },
          ]}
          activeTab="tab1"
          onChange={handleTabChange}
        />
      );

      const tab2 = screen.getByRole('button', { name: /architecture/i });
      fireEvent.click(tab2);
      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Slider', () => {
    it('renders label, value, and triggers onChange', () => {
      const handleChange = vi.fn();
      render(
        <Slider
          label="Target QPS"
          value={5000}
          min={100}
          max={10000}
          step={100}
          unit=" req/s"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Target QPS')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText(/req\/s/i)).toBeInTheDocument();
    });
  });
});

describe('Interactive Simulation Labs', () => {
  it('renders LoadBalancerLab and allows algorithm selection and traffic dispatching', () => {
    render(
      <AppProvider>
        <LoadBalancerLab />
      </AppProvider>
    );

    expect(screen.getByText(/Load Balancer Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Balancing Algorithm/i)).toBeInTheDocument();

    // Dispatch traffic
    const dispatchBtn = screen.getByRole('button', { name: /Dispatch 50 Requests/i });
    expect(dispatchBtn).toBeInTheDocument();
    fireEvent.click(dispatchBtn);

    // Change algorithm to Least Connections
    const leastConnOption = screen.getByRole('button', { name: /Least Connections/i });
    fireEvent.click(leastConnOption);

    // Reset simulator
    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);
  });

  it('renders RateLimiterLab and handles burst requests', () => {
    render(
      <AppProvider>
        <RateLimiterLab />
      </AppProvider>
    );

    expect(screen.getByText(/Rate Limiter Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Algorithm Type/i)).toBeInTheDocument();

    // Click Simulate Burst (5 Requests)
    const burstBtn = screen.getByRole('button', { name: /Simulate Burst/i });
    fireEvent.click(burstBtn);

    // Check stats are rendered
    expect(screen.getByText(/Requests Accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/Requests Throttled \(429\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Drop Ratio/i)).toBeInTheDocument();
  });
});
