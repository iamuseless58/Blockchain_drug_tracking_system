import React, { useState } from 'react';
import { DrugBatch, SupplyChainEvent, SupplyChainStage } from '../blockchain/types';
import {
  Truck,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface InteractiveRouteMapProps {
  batch: DrugBatch;
  events: SupplyChainEvent[];
}

interface RouteNode {
  id: SupplyChainStage;
  label: string;
  sublabel: string;
  city: string;
  icon: any;
  color: string;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  batch,
  events,
}) => {
  const [selectedStage, setSelectedStage] = useState<SupplyChainStage>(batch.currentStage);

  const routeNodes: RouteNode[] = [
    {
      id: 'RAW_MATERIAL',
      label: 'Raw Materials',
      sublabel: 'API Chemical Synthesis',
      city: 'API Chemical Synthesis Hub',
      icon: Building,
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    },
    {
      id: 'MANUFACTURING',
      label: 'Manufacturer',
      sublabel: batch.manufacturer,
      city: batch.originLocation,
      icon: Building,
      color: 'text-teal-400 border-teal-500/40 bg-teal-500/10',
    },
    {
      id: 'DISTRIBUTION',
      label: 'Distributor',
      sublabel: 'ColdLink Logistics Fleet',
      city: 'Central Logistics Corridor',
      icon: Truck,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    },
    {
      id: 'WHOLESALE',
      label: 'Wholesaler',
      sublabel: 'Central Pharma Hub',
      city: 'Regional Wholesale Depot',
      icon: Building,
      color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
    },
    {
      id: 'RETAIL_PHARMACY',
      label: 'Pharmacy / Hospital',
      sublabel: 'Super-Speciality Clinic',
      city: batch.destination || 'Hospital Dispensary',
      icon: MapPin,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    },
    {
      id: 'PATIENT_DISPENSED',
      label: 'Patient',
      sublabel: 'Dispensed & Verified',
      city: 'End Patient Verification',
      icon: ShieldCheck,
      color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    },
  ];

  const stageOrder: SupplyChainStage[] = [
    'RAW_MATERIAL',
    'MANUFACTURING',
    'DISTRIBUTION',
    'WHOLESALE',
    'RETAIL_PHARMACY',
    'PATIENT_DISPENSED',
  ];

  const currentStageIndex = stageOrder.indexOf(batch.currentStage);

  const getStageEvents = (stage: SupplyChainStage) => {
    return events.filter((e) => e.stage === stage);
  };

  const selectedNodeEvents = getStageEvents(selectedStage);
  const activeNode = routeNodes.find((n) => n.id === selectedStage) || routeNodes[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-teal-400">
            Logistics Geonavigation & Chain of Custody
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Pharmaceutical Transit Corridor: {batch.drugName}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Tracking Batch: <span className="text-teal-300 font-semibold">{batch.batchId}</span> • 
            Current Location: <span className="text-white font-semibold">{batch.currentLocation}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-teal-500/10 border border-teal-500/30 text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Real-Time GPS & IoT Telemetry
          </span>
        </div>
      </div>

      {/* Visual Interactive Supply Chain Route Stepper */}
      <div className="relative my-8 overflow-x-auto pb-4">
        {/* Background track line */}
        <div className="absolute top-7 left-6 right-6 h-1 bg-slate-800 z-0 hidden md:block"></div>

        {/* Progress highlight line */}
        <div
          className="absolute top-7 left-6 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 z-0 transition-all duration-700 hidden md:block"
          style={{
            width: `${Math.min(100, Math.max(0, (currentStageIndex / (stageOrder.length - 1)) * 95))}%`,
          }}
        ></div>

        <div className="flex items-start justify-between min-w-[700px] relative z-10">
          {routeNodes.map((node, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;
            const isSelected = selectedStage === node.id;
            const Icon = node.icon;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedStage(node.id)}
                className={`flex flex-col items-center group cursor-pointer text-center transition-all ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
                style={{ width: `${100 / routeNodes.length}%` }}
              >
                {/* Node icon circle */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg ${
                    isCurrent
                      ? 'bg-teal-500 text-slate-950 border-teal-300 ring-4 ring-teal-500/30 animate-pulse-slow'
                      : isCompleted
                      ? 'bg-slate-800 text-teal-400 border-teal-500/60 shadow-teal-950/40'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Node Labels */}
                <div className="mt-3">
                  <span
                    className={`text-xs font-bold block ${
                      isCurrent
                        ? 'text-teal-300'
                        : isCompleted
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {node.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 line-clamp-1 max-w-[120px]">
                    {node.city}
                  </span>
                </div>

                {/* Status chip */}
                <div className="mt-1">
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      CURRENT STAGE
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                      Completed
                    </span>
                  )}
                  {isPending && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-600">
                      Upcoming
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="mt-6 p-5 bg-slate-950/70 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${activeNode.color}`}>
              <activeNode.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono text-slate-400">Stage Inspection</span>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                {activeNode.label}
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-teal-400">{activeNode.city}</span>
              </h4>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Associated Events: <span className="text-teal-300 font-semibold">{selectedNodeEvents.length}</span>
          </div>
        </div>

        {/* Events at this stage */}
        <div className="mt-4 space-y-3">
          {selectedNodeEvents.length === 0 ? (
            <div className="py-6 text-center text-slate-500 font-mono text-xs">
              No blockchain transitions recorded yet for this stage.
            </div>
          ) : (
            selectedNodeEvents.map((evt) => (
              <div
                key={evt.eventId}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 font-bold font-mono text-[10px] rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {evt.eventType}
                    </span>
                    <span className="font-semibold text-white">{evt.notes}</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Handler: <span className="text-slate-200">{evt.handler}</span> • Location:{' '}
                    <span className="text-slate-200">{evt.location}</span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end text-slate-400 font-mono text-[11px] shrink-0">
                  <span>{evt.formattedTime}</span>
                  <span className="text-cyan-400">Block #{evt.blockIndex}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
