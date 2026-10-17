import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, ListOrdered, ArrowRight, Play, Database, CheckCircle2 } from 'lucide-react';

interface DomainEvent {
  id: string;
  type: string;
  payload: string;
  timestamp: string;
  projected: boolean;
}

interface ReadModelOrder {
  orderId: string;
  items: string[];
  totalPrice: number;
  status: string;
}

export const CqrsEventSourcingLab: React.FC = () => {
  const [eventStore, setEventStore] = useState<DomainEvent[]>([
    { id: 'ev-1', type: 'OrderCreated', payload: 'OrderID: #1001, Customer: Alice', timestamp: '10:00:01', projected: true },
    { id: 'ev-2', type: 'ItemAdded', payload: 'SKU: MacBookPro, Qty: 1, Price: $2000', timestamp: '10:00:15', projected: true },
  ]);

  const [readModel, setReadModel] = useState<ReadModelOrder>({
    orderId: '#1001',
    items: ['MacBookPro ($2000)'],
    totalPrice: 2000,
    status: 'ACTIVE',
  });

  const [projectionLagMs, setProjectionLagMs] = useState<number>(1000);
  const [isProjecting, setIsProjecting] = useState<boolean>(false);
  const [logMessage, setLogMessage] = useState<string>('CQRS & Event Sourcing initialized.');

  const handleSendCommand = (commandType: string) => {
    let newEvent: DomainEvent;
    const nowStr = new Date().toLocaleTimeString();

    if (commandType === 'AddItem') {
      newEvent = {
        id: `ev-${eventStore.length + 1}`,
        type: 'ItemAdded',
        payload: 'SKU: AirPodMax, Qty: 1, Price: $500',
        timestamp: nowStr,
        projected: false,
      };
    } else if (commandType === 'ApplyDiscount') {
      newEvent = {
        id: `ev-${eventStore.length + 1}`,
        type: 'DiscountApplied',
        payload: 'Code: SAVE200, Amount: -$200',
        timestamp: nowStr,
        projected: false,
      };
    } else {
      newEvent = {
        id: `ev-${eventStore.length + 1}`,
        type: 'OrderPaid',
        payload: 'TxHash: 0x93f2, Amount: Settled',
        timestamp: nowStr,
        projected: false,
      };
    }

    // Append to Event Store immediately (fast write!)
    setEventStore(prev => [...prev, newEvent]);
    setLogMessage(`COMMAND EXECUTED: Appended "${newEvent.type}" to Event Store. Read model lag active.`);

    // Trigger async projection after projectionLagMs
    setIsProjecting(true);
    setTimeout(() => {
      setEventStore(prev => prev.map(e => e.id === newEvent.id ? { ...e, projected: true } : e));

      // Update Materialized Read Model View
      setReadModel(curr => {
        if (commandType === 'AddItem') {
          return {
            ...curr,
            items: [...curr.items, 'AirPodMax ($500)'],
            totalPrice: curr.totalPrice + 500,
          };
        } else if (commandType === 'ApplyDiscount') {
          return {
            ...curr,
            totalPrice: Math.max(0, curr.totalPrice - 200),
          };
        } else {
          return {
            ...curr,
            status: 'COMPLETED & PAID',
          };
        }
      });

      setIsProjecting(false);
      setLogMessage(`PROJECTION COMPLETE: Read Model materialized view updated for "${newEvent.type}".`);
    }, projectionLagMs);
  };

  const handleReset = () => {
    setEventStore([
      { id: 'ev-1', type: 'OrderCreated', payload: 'OrderID: #1001, Customer: Alice', timestamp: '10:00:01', projected: true },
      { id: 'ev-2', type: 'ItemAdded', payload: 'SKU: MacBookPro, Qty: 1, Price: $2000', timestamp: '10:00:15', projected: true },
    ]);
    setReadModel({
      orderId: '#1001',
      items: ['MacBookPro ($2000)'],
      totalPrice: 2000,
      status: 'ACTIVE',
    });
    setProjectionLagMs(1000);
    setIsProjecting(false);
    setLogMessage('CQRS system reset.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <ListOrdered className="w-4 h-4 mr-2 text-indigo-500" />
            Command Pipeline
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Slider
            label="Asynchronous Projection Lag"
            value={projectionLagMs}
            min={200}
            max={3000}
            step={200}
            unit=" ms"
            onChange={setProjectionLagMs}
            description="Delay before background worker projects event store into read views."
          />

          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issue Domain Commands:
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => handleSendCommand('AddItem')}
              >
                <span>Command: Add Item (AirPods)</span>
                <span className="text-xs text-blue-500">+$500</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => handleSendCommand('ApplyDiscount')}
              >
                <span>Command: Apply Coupon</span>
                <span className="text-xs text-emerald-500">-$200</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleSendCommand('PayOrder')}
              >
                Command: Pay & Finalize Order
              </Button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-slate-700 dark:text-gray-300">
          {logMessage}
        </div>
      </Card>

      {/* Write Event Store vs Read Model Materialized View */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Write Side: Immutable Event Store */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
              <Database className="w-4 h-4 mr-2 text-purple-500" />
              Event Store (Append-Only Log)
            </span>
            <span className="text-xs font-mono text-slate-400">
              {eventStore.length} events
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {eventStore.map(ev => (
              <div
                key={ev.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-gray-800 text-xs space-y-1 bg-white dark:bg-gray-900"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-purple-600 dark:text-purple-400 font-mono">{ev.type}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-[11px] truncate">
                  {ev.payload}
                </div>
                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100 dark:border-gray-800">
                  <span className="text-slate-400">Event ID: {ev.id}</span>
                  <span className={`font-semibold ${ev.projected ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {ev.projected ? 'Projected' : 'Pending Lag...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Read Side: Materialized View */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
              Materialized Query View (Read Model)
            </span>
            {isProjecting && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 font-medium">
                Syncing projection...
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{readModel.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{readModel.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Purchased Items:</span>
              <div className="space-y-1">
                {readModel.items.map((item, i) => (
                  <div key={i} className="font-mono text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-slate-200 dark:border-gray-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-gray-700 font-bold text-sm">
              <span>Total Price:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">${readModel.totalPrice}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
