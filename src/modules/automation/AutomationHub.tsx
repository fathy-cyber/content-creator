import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AutomationLayout from './ui/AutomationLayout';
import WorkflowDashboard from './ui/AutomationDashboard';
import VisualFlowBuilder from './ui/VisualFlowBuilder';
import IntegrationManager from './ui/IntegrationManager';
import TemplateGallery from './ui/TemplateLibrary';
import ExecutionLogs from './ui/ExecutionLogs';
import TasksManager from './ui/TasksManager';
import { ModuleLoadingFallback } from '../../core/kernel/ModuleLoader';

const CRMSalesAutomation = lazy(() => import('./ui/CRMSalesAutomation'));
const MarketingAutomation = lazy(() => import('./ui/MarketingAutomation'));
const FinancialAutomation = lazy(() => import('./ui/FinancialAutomation'));
const LearningCenter = lazy(() => import('./ui/LearningCenter'));

export default function AutomationHub() {
  return (
    <AutomationLayout>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <h2 className="text-lg font-bold text-blue-900">AutomationHub Debug</h2>
        <p className="text-blue-700">Component is rendering successfully</p>
      </div>
      <Suspense fallback={<ModuleLoadingFallback />}>
        <Routes>
          <Route index element={<WorkflowDashboard />} />
          <Route path="dashboard" element={<WorkflowDashboard />} />
          <Route path="builder" element={<VisualFlowBuilder />} />
          <Route path="integrations" element={<IntegrationManager />} />
          <Route path="templates" element={<TemplateGallery />} />
          <Route path="logs" element={<ExecutionLogs />} />
          <Route path="tasks" element={<TasksManager />} />
          <Route path="crm-sales" element={<CRMSalesAutomation />} />
          <Route path="marketing" element={<MarketingAutomation />} />
          <Route path="finance" element={<FinancialAutomation />} />
          <Route path="learn" element={<LearningCenter />} />
        </Routes>
      </Suspense>
    </AutomationLayout>
  );
}
