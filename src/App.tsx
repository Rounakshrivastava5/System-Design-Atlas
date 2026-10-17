import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Shell } from './components/layout/Shell';
import { DashboardView } from './features/dashboard/DashboardView';
import { ConceptCatalogView } from './features/concepts/ConceptCatalogView';
import { ConceptDetailView } from './features/concepts/ConceptDetailView';
import { LabsCatalogView } from './features/labs/LabsCatalogView';
import { LabWorkspaceView } from './features/labs/LabWorkspaceView';
import { WorkbenchView } from './features/workbench/WorkbenchView';
import { PracticeHubView } from './features/practice/PracticeHubView';
import { CaseStudyDetailView } from './features/practice/CaseStudyDetailView';

const RouteDispatcher: React.FC = () => {
  const { currentRoute } = useApp();

  // Strip leading hash and query parameters for route matching
  const cleanRoute = currentRoute.replace(/^#\/?/, '').split('?')[0];
  const parts = cleanRoute.split('/').filter(Boolean);

  if (parts.length === 0) {
    return <DashboardView />;
  }

  // /concepts or /concepts/:id
  if (parts[0] === 'concepts') {
    if (parts[1]) {
      return <ConceptDetailView conceptId={parts[1]} />;
    }
    return <ConceptCatalogView />;
  }

  // /labs or /labs/:id
  if (parts[0] === 'labs') {
    if (parts[1]) {
      return <LabWorkspaceView labId={parts[1]} />;
    }
    return <LabsCatalogView />;
  }

  // /workbench
  if (parts[0] === 'workbench') {
    return <WorkbenchView />;
  }

  // /practice or /practice/case-studies/:id
  if (parts[0] === 'practice') {
    if (parts[1] === 'case-studies' && parts[2]) {
      return <CaseStudyDetailView caseStudyId={parts[2]} />;
    }
    return <PracticeHubView />;
  }

  // Fallback to Dashboard
  return <DashboardView />;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Shell>
        <RouteDispatcher />
      </Shell>
    </AppProvider>
  );
};

export default App;
