import React, { useCallback, useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position,
  NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../../../store/automation/workflowStore';
import { workflowApi } from '../api/workflow.api';
import { 
   Zap, 
   Play, 
   ArrowRight, 
   Settings2, 
   Trash2,
   Plus,
   Loader2,
   X
  } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '@/lib/utils';
import { 
   Card, 
   CardContent, 
   CardDescription, 
   CardFooter, 
   CardHeader, 
   CardTitle 
  } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { toast } from "sonner"; // Assuming sonner is available as it's standard for shadcn/ui now


// --- Custom Node Components ---

const NodeWrapper = ({ children, label, icon: Icon, color, onSettingsClick, onDeleteClick }: any) => (
  <Card className="min-w-[200px] shadow-lg border-2 border-zinc-200 group hover:border-indigo-500 transition-all">
    <CardContent className="p-0">
      <div className={cn("p-3 flex items-center gap-3 border-b border-zinc-100", color)}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="p-4">
        <div className="text-sm font-semibold text-zinc-900 mb-2">{children}</div>
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6 text-zinc-400 hover:text-zinc-900"
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick();
            }}
          >
            <Settings2 className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6 text-zinc-400 hover:text-rose-600"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Main Builder Component ---

export default function VisualFlowBuilder() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNodeWithPosition,
    updateNodeData,
    removeNode
  } = useWorkflowStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsSettingsOpen(true);
  }, []);

  const TriggerNode = useCallback(({ id, data }: NodeProps) => {
    const { removeNode } = useWorkflowStore();
    return (
      <div className="relative">
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
        <NodeWrapper 
          label="Trigger" 
          icon={Zap} 
          color="bg-indigo-50 text-indigo-600"
          onDeleteClick={() => removeNode(id)}
          onSettingsClick={() => handleOpenSettings(id)}
        >
          {data.label || 'New Lead Received'}
        </NodeWrapper>
      </div>
    );
  }, [handleOpenSettings]);

  const StepNode = useCallback(({ id, data }: NodeProps) => {
    const { removeNode } = useWorkflowStore();
    return (
      <div className="relative">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-zinc-400" />
        <NodeWrapper 
          label="Step" 
          icon={ArrowRight} 
          color="bg-zinc-50 text-zinc-600"
          onDeleteClick={() => removeNode(id)}
          onSettingsClick={() => handleOpenSettings(id)}
        >
          {data.label || 'Filter by Country'}
        </NodeWrapper>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-zinc-400" />
      </div>
    );
  }, [handleOpenSettings]);

  const ActionNode = useCallback(({ id, data }: NodeProps) => {
    const { removeNode } = useWorkflowStore();
    return (
      <div className="relative">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-zinc-400" />
        <NodeWrapper 
          label="Action" 
          icon={Play} 
          color="bg-emerald-50 text-emerald-600"
          onDeleteClick={() => removeNode(id)}
          onSettingsClick={() => handleOpenSettings(id)}
        >
          {data.label || 'Send Welcome Email'}
        </NodeWrapper>
      </div>
    );
  }, [handleOpenSettings]);

  const nodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    step: StepNode,
    action: ActionNode,
  }), [TriggerNode, StepNode, ActionNode]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const onAddNode = (type: 'trigger' | 'step' | 'action') => {
    const id = addNodeWithPosition(type);
    setSelectedNodeId(id);
  };

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      const result = await workflowApi.createWorkflow({
        workspaceId: 'default-workspace',
        name: publish ? 'Published Workflow' : 'Draft Workflow',
        definition: {
          nodes,
          edges
        }
      });

      if ((result as any).error) {
        toast.error(`Error saving workflow: ${(result as any).error}`);
      } else {
        toast.success(publish ? 'Workflow published successfully!' : 'Draft saved successfully!');
      }
    } catch (error: any) {
      toast.error(`Unexpected error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Toolbar */}
      <div className="w-64 shrink-0 flex flex-col gap-4">
        <Card className="shadow-sm border-zinc-200">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Add Elements</h3>
            
            <div className="space-y-2">
              <Button 
                onClick={() => onAddNode('trigger')}
                className="w-full justify-start gap-3 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Zap className="w-4 h-4" /> Trigger
              </Button>
              <Button 
                onClick={() => onAddNode('step')}
                className="w-full justify-start gap-3 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                <ArrowRight className="w-4 h-4" /> Step / Filter
              </Button>
              <Button 
                onClick={() => onAddNode('action')}
                className="w-full justify-start gap-3 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="w-4 h-4" /> Action
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200 flex-1">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Workflow Properties</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="node-label" className="text-xs font-medium text-zinc-500">Node Label</Label>
                  <Input 
                    id="node-label"
                    value={(selectedNode.data as any).label || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="pt-4 border-t border-zinc-100">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => {
                      removeNode(selectedNode.id);
                      setSelectedNodeId(null);
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete Node
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-500 italic">
                Select a node to edit its properties.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-3xl overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            setSelectedNodeId(node.id);
          }}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            variant="outline" 
            className="bg-white shadow-sm"
            disabled={isSaving}
            onClick={() => handleSave(false)}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Draft
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            disabled={isSaving}
            onClick={() => handleSave(true)}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Publish Workflow
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Node Configuration</SheetTitle>
            <SheetDescription>
              Configure the settings for your selected node.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheet-node-label" className="text-sm font-medium">Node Label</Label>
                  <Input 
                    id="sheet-node-label"
                    value={(selectedNode.data as any).label || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    placeholder="Enter a descriptive label"
                  />
                </div>
                
                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-zinc-500">Advanced Options</h4>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Execution Delay (ms)</Label>
                    <Input type="number" placeholder="0" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Retry Policy</Label>
                    <select className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-md">
                      <option>No Retry</option>
                      <option>Retry 3 times</option>
                      <option>Retry until success</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 flex justify-between items-center">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                      removeNode(selectedNode.id);
                      setSelectedNodeId(null);
                      setIsSettingsOpen(false);
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete Node
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                No node selected. Please select a node on the canvas to configure.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
