import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LABS } from '../../data/labs';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Lab simulation components (will be connected in Milestone 3)
import { LoadBalancerLab } from './simulators/LoadBalancerLab';
import { CachingStrategiesLab } from './simulators/CachingStrategiesLab';
import { DatabaseShardingLab } from './simulators/DatabaseShardingLab';
import { RateLimiterLab } from './simulators/RateLimiterLab';
import { CapConsensusLab } from './simulators/CapConsensusLab';
import { MessageQueueLab } from './simulators/MessageQueueLab';
import { ConsistentHashingLab } from './simulators/ConsistentHashingLab';
import { CdnEdgeLab } from './simulators/CdnEdgeLab';
import { CircuitBreakerLab } from './simulators/CircuitBreakerLab';
import { SnowflakeIdLab } from './simulators/SnowflakeIdLab';
import { ReplicationFailoverLab } from './simulators/ReplicationFailoverLab';
import { CqrsEventSourcingLab } from './simulators/CqrsEventSourcingLab';

interface LabWorkspaceViewProps {
  labId: string;
}

export const LabWorkspaceView: React.FC<LabWorkspaceViewProps> = ({ labId }) => {
  const { progress, markConceptComplete, navigateTo } = useApp();
  const lab = LABS.find(l => l.id === labId);
  const [showAssumptions, setShowAssumptions] = useState(true);

  if (!lab) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">Lab Not Found</h2>
        <p className="text-sm text-slate-500">The simulation lab "{labId}" does not exist.</p>
        <Button variant="primary" onClick={() => navigateTo('#/labs')}>
          Return to Labs Catalog
        </Button>
      </div>
    );
  }

  const renderSimulator = () => {
    switch (lab.id) {
      case 'lb-lab':
        return <LoadBalancerLab />;
      case 'cache-lab':
        return <CachingStrategiesLab />;
      case 'sharding-lab':
        return <DatabaseShardingLab />;
      case 'rate-limit-lab':
        return <RateLimiterLab />;
      case 'cap-lab':
        return <CapConsensusLab />;
      case 'queue-lab':
        return <MessageQueueLab />;
      case 'consistent-hashing-lab':
        return <ConsistentHashingLab />;
      case 'cdn-lab':
        return <CdnEdgeLab />;
      case 'circuit-breaker-lab':
        return <CircuitBreakerLab />;
      case 'snowflake-lab':
        return <SnowflakeIdLab />;
      case 'replication-lab':
        return <ReplicationFailoverLab />;
      case 'cqrs-lab':
        return <CqrsEventSourcingLab />;
      default:
        return <div className="p-8 text-center text-slate-500">Simulator module loading...</div>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('#/labs')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-1"
          >
            All Labs
          </Button>
          <div className="flex items-center space-x-2">
            <Badge variant="domain" domain={lab.domain}>
              {lab.domain}
            </Badge>
            <Badge variant="difficulty" difficulty={lab.difficulty}>
              {lab.difficulty}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lab.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-3xl">
            {lab.shortDescription}
          </p>
        </div>

        {lab.pairedConceptId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo(`#/concepts/${lab.pairedConceptId}`)}
            icon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Read Concept Theory
          </Button>
        )}
      </div>

      {/* Simulator Component Viewport */}
      <div className="space-y-6">
        {renderSimulator()}
      </div>

      {/* Simulation Assumptions & Simplifications Accordion */}
      <Card className="p-5 border-amber-500/20 bg-amber-500/5">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full flex items-center justify-between text-left font-semibold text-sm text-slate-900 dark:text-gray-100"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Simulation Assumptions & Real-World Simplifications</span>
          </div>
          {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAssumptions && (
          <div className="mt-4 pt-3 border-t border-amber-500/10 space-y-3 text-xs">
            {lab.assumptions.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="font-semibold text-slate-800 dark:text-gray-200">
                  Assumption {idx + 1}: {item.assumption}
                </span>
                <p className="text-slate-600 dark:text-gray-400">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Real-World Difference: </span>
                  {item.realWorldDifference}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
