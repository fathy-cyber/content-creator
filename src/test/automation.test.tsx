import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock lazy components to avoid issues with Suspense in tests
vi.mock('@/app/automation/dashboard/WorkflowDashboard', () => ({ default: () => <div>Workflow Dashboard Page</div> }));
vi.mock('@/app/automation/builder/VisualFlowBuilder', () => ({ default: () => <div>Visual Flow Builder Page</div> }));
vi.mock('@/app/automation/integrations/IntegrationManager', () => ({ default: () => <div>Integration Manager Page</div> }));
vi.mock('@/app/automation/templates/TemplateGallery', () => ({ default: () => <div>Template Gallery Page</div> }));
vi.mock('@/app/automation/logs/ExecutionLogs', () => ({ default: () => <div>Execution Logs Page</div> }));
vi.mock('@/app/automation/tasks/TasksManager', () => ({ default: () => <div>Tasks Manager Page</div> }));
vi.mock('@/pages/automation/CRMSalesAutomation', () => ({ default: () => <div>CRM Sales Automation Page</div> }));
vi.mock('@/pages/automation/MarketingAutomation', () => ({ default: () => <div>Marketing Automation Page</div> }));
vi.mock('@/pages/automation/FinancialAutomation', () => ({ default: () => <div>Financial Automation Page</div> }));
vi.mock('@/pages/automation/LearningCenter', () => ({ default: () => <div>Learning Center Page</div> }));

import AutomationHub from '@/app/automation/AutomationHub';
import { KernelProvider } from '@/core/react/KernelProvider';
import { AutomationModuleManifest } from '@/modules/existingModules';

const renderAutomationHub = (initialEntries = ['/automation/dashboard']) => {
  return render(
    <KernelProvider manifests={[AutomationModuleManifest]} installedIds={['automation']}>
      <MemoryRouter initialEntries={initialEntries}>
        <AutomationHub />
      </MemoryRouter>
    </KernelProvider>
  );
};

describe('Automation Hub Routing', () => {
  it('renders WorkflowDashboard for /automation/dashboard', async () => {
    renderAutomationHub(['/automation/dashboard']);
    expect(await screen.findByText('Workflow Dashboard Page')).toBeInTheDocument();
  });

  it('renders WorkflowDashboard for /automation (root)', async () => {
    renderAutomationHub(['/automation']);
    expect(await screen.findByText('Workflow Dashboard Page')).toBeInTheDocument();
  });

  it('renders VisualFlowBuilder for /automation/builder', async () => {
    renderAutomationHub(['/automation/builder']);
    expect(await screen.findByText('Visual Flow Builder Page')).toBeInTheDocument();
  });

  it('renders IntegrationManager for /automation/integrations', async () => {
    renderAutomationHub(['/automation/integrations']);
    expect(await screen.findByText('Integration Manager Page')).toBeInTheDocument();
  });

  it('renders TemplateGallery for /automation/templates', async () => {
    renderAutomationHub(['/automation/templates']);
    expect(await screen.findByText('Template Gallery Page')).toBeInTheDocument();
  });

  it('renders ExecutionLogs for /automation/logs', async () => {
    renderAutomationHub(['/automation/logs']);
    expect(await screen.findByText('Execution Logs Page')).toBeInTheDocument();
  });

  it('renders TasksManager for /automation/tasks', async () => {
    renderAutomationHub(['/automation/tasks']);
    expect(await screen.findByText('Tasks Manager Page')).toBeInTheDocument();
  });

  it('renders CRMSalesAutomation for /automation/crm-sales', async () => {
    renderAutomationHub(['/automation/crm-sales']);
    expect(await screen.findByText('CRM Sales Automation Page')).toBeInTheDocument();
  });

  it('renders MarketingAutomation for /automation/marketing', async () => {
    renderAutomationHub(['/automation/marketing']);
    expect(await screen.findByText('Marketing Automation Page')).toBeInTheDocument();
  });

  it('renders FinancialAutomation for /automation/finance', async () => {
    renderAutomationHub(['/automation/finance']);
    expect(await screen.findByText('Financial Automation Page')).toBeInTheDocument();
  });

  it('renders LearningCenter for /automation/learn', async () => {
    renderAutomationHub(['/automation/learn']);
    expect(await screen.findByText('Learning Center Page')).toBeInTheDocument();
  });
});

describe('Automation Hub Navigation', () => {
  it('contains links to all expected sections in the sidebar', async () => {
    renderAutomationHub();
    
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Workflow Builder')).toBeInTheDocument();
    expect(await screen.findByText('Templates')).toBeInTheDocument();
    expect(await screen.findByText('Integrations')).toBeInTheDocument();
    expect(await screen.findByText('Tasks')).toBeInTheDocument();
    expect(await screen.findByText('Logs')).toBeInTheDocument();
    expect(await screen.findByText('Learning Center')).toBeInTheDocument();
  });

  it('contains the Learning Center link in the AutomationLayout sidebar', async () => {
    renderAutomationHub();
    expect(await screen.findByText('Learning Center')).toBeInTheDocument();
  });
});
