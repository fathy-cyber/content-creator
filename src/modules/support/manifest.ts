import { lazy } from 'react';
import { supportService } from './supportService';
import SupportTicketList from './pages/SupportTicketList';

export const supportManifest = {
  id: 'support',
  name: 'Support Module',
  depends: [],
  models: [],
  services: {
    support: supportService,
  },
  routes: [
    { path: '/support/tickets', component: SupportTicketList, label: 'Support Tickets' },
  ],
  navigation: [
    { id: 'sup-hub', label: 'Support', href: '/support/tickets', icon: 'LifeBuoy', sequence: 160 },
  ],
};
