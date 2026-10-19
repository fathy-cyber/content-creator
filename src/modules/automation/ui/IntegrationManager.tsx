import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ExternalLink, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';

const INTEGRATIONS = [
  { 
    id: 'whatsapp', 
    name: 'WhatsApp Business', 
    description: 'Send automated messages and manage customer conversations on WhatsApp.', 
    status: 'connected', 
    category: 'Messaging', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' 
  },
  { 
    id: 'facebook', 
    name: 'Facebook Ads', 
    description: 'Capture leads from Facebook Lead Ads and trigger automated follow-ups.', 
    status: 'connected', 
    category: 'Advertising', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' 
  },
  { 
    id: 'hubspot', 
    name: 'HubSpot CRM', 
    description: 'Sync contact data, deal stages, and activity logs with HubSpot.', 
    status: 'disconnected', 
    category: 'CRM', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HubSpot_Logo.svg/1200px-HubSpot_Logo.svg.png' 
  },
  { 
    id: 'mailchimp', 
    name: 'Mailchimp', 
    description: 'Manage email lists and trigger campaigns based on user behavior.', 
    status: 'error', 
    category: 'Email', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mailchimp_logo.svg/1200px-Mailchimp_logo.svg.png' 
  },
  { 
    id: 'slack', 
    name: 'Slack', 
    description: 'Get real-time notifications and alerts for your workflows in Slack channels.', 
    status: 'connected', 
    category: 'Communication', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1200px-Slack_icon_2019.svg.png' 
  },
  { 
    id: 'google_sheets', 
    name: 'Google Sheets', 
    description: 'Read and write data to spreadsheets for reporting and data storage.', 
    status: 'disconnected', 
    category: 'Data', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/1200px-Google_Sheets_logo_%282014-2020%29.svg.png' 
  },
];

export default function IntegrationManager() {
  const [connections, setConnections] = useState(INTEGRATIONS);

  const toggleConnection = (id: string) => {
    setConnections(prev => prev.map(int => {
      if (int.id === id) {
        return { ...int, status: int.status === 'connected' ? 'disconnected' : 'connected' };
      }
      return int;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Integrations</h1>
          <p className="text-zinc-500">Connect your favorite tools to power your automations.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-fit">
          <Plus className="w-4 h-4" /> Request Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((int) => (
          <Card key={int.id} className="group hover:border-indigo-300 transition-all duration-300 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <img src={int.icon} alt={int.name} className="w-full h-full object-contain" />
                </div>
                <Badge 
                  variant={int.status === 'connected' ? 'default' : 'secondary'}
                  className={cn(
                    "font-semibold",
                    int.status === 'connected' && "bg-emerald-500 hover:bg-emerald-600",
                    int.status === 'error' && "bg-rose-500 hover:bg-rose-600"
                  )}
                >
                  {int.status === 'connected' ? 'Connected' : int.status === 'error' ? 'Error' : 'Disconnected'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-zinc-900">{int.name}</CardTitle>
              <CardDescription className="text-sm text-zinc-500 line-clamp-2">
                {int.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-50 w-fit px-2 py-1 rounded-md">
                <Settings className="w-3 h-3" /> {int.category}
              </div>
            </CardContent>

            <CardFooter className="bg-zinc-50/50 p-4 border-t border-zinc-100 flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 gap-2">
                      <ExternalLink className="w-3.5 h-3.5" /> Docs
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View integration documentation</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {int.status === 'connected' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleConnection(int.id)}
                  className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => toggleConnection(int.id)}
                  className={cn(
                    "gap-2",
                    int.status === 'error' ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  {int.status === 'error' ? <RefreshCw className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {int.status === 'error' ? 'Reconnect' : 'Connect'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
