import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Zap, 
  Clock, 
  Mail, 
  MessageSquare, 
  UserPlus,
  Filter
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';

const TEMPLATES = [
  { 
    id: 'tpl_1', 
    name: 'E-commerce Welcome Sequence', 
    description: 'A 5-step email and SMS sequence to welcome new customers and drive their first purchase.', 
    category: 'Sales', 
    difficulty: 'Easy', 
    estimatedTime: '15 mins', 
    icon: Mail, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50' 
  },
  { 
    id: 'tpl_2', 
    name: 'Lead Magnet Delivery', 
    description: 'Automatically deliver a PDF guide via email when a user signs up through a landing page.', 
    category: 'Lead Gen', 
    difficulty: 'Easy', 
    estimatedTime: '10 mins', 
    icon: UserPlus, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50' 
  },
  { 
    id: 'tpl_3', 
    name: 'Abandoned Cart Recovery', 
    description: 'Multi-channel recovery flow using SMS and Email to bring back lost sales.', 
    category: 'Sales', 
    difficulty: 'Medium', 
    estimatedTime: '30 mins', 
    icon: Zap, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50' 
  },
  { 
    id: 'tpl_4', 
    name: 'Customer Feedback Loop', 
    description: 'Automatically request a review after order delivery and escalate negative feedback to support.', 
    category: 'Support', 
    difficulty: 'Medium', 
    estimatedTime: '25 mins', 
    icon: MessageSquare, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-50' 
  },
  { 
    id: 'tpl_5', 
    name: 'Appointment Reminder', 
    description: 'Send a reminder 24 hours and 1 hour before a scheduled appointment to reduce no-shows.', 
    category: 'Operations', 
    difficulty: 'Easy', 
    estimatedTime: '15 mins', 
    icon: Clock, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50' 
  },
  { 
    id: 'tpl_6', 
    name: 'VIP Customer Onboarding', 
    description: 'High-touch onboarding sequence for high-ticket clients including personal outreach.', 
    category: 'Sales', 
    difficulty: 'Hard', 
    estimatedTime: '60 mins', 
    icon: Zap, 
    color: 'text-purple-500', 
    bg: 'bg-purple-50' 
  },
];

export default function TemplateGallery() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Template Gallery</h1>
          <p className="text-zinc-500">Jumpstart your automation with pre-built industry blueprints.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <Button 
              key={cat} 
              variant={category === cat ? 'default' : 'outline'} 
              className={category === cat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white'}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <Card key={tpl.id} className="group hover:border-indigo-300 transition-all duration-300 shadow-sm flex flex-col">
              <CardHeader>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300", tpl.bg)}>
                  <Icon className={cn("w-6 h-6", tpl.color)} />
                </div>
                <CardTitle className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {tpl.name}
                </CardTitle>
                <CardDescription className="text-sm text-zinc-500 line-clamp-2 mt-2">
                  {tpl.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-medium text-zinc-600 bg-zinc-100">
                    {tpl.category}
                  </Badge>
                  <Badge variant="secondary" className="font-medium text-zinc-600 bg-zinc-100">
                    {tpl.difficulty}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="border-t border-zinc-100 p-4 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Clock className="w-3.5 h-3.5" /> {tpl.estimatedTime}
                </div>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 group/btn">
                  Use Template <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-3xl">
          <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No templates found</h3>
          <p className="text-zinc-500">Try searching for something else or browse all categories.</p>
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
