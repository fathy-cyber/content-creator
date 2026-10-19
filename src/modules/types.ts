import React, { ReactNode } from 'react';

export interface AppManifest {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  version: string;
  isCore?: boolean;
  sidebarLinks: {
    label: string;
    href: string;
    icon: ReactNode;
  }[];
  dashboardWidgets?: React.FC[];
}
