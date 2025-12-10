import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlayCircle, X, Plus, Save, Upload } from 'lucide-react';

// Mock API
const mockAPI = {
  getAutomations: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
      { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
      { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
      { id: 'create_ticket', label: 'Create Ticket', params: ['title', 'priority'] },
    ];
  },
  simulate: async (workflow) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const steps = workflow.nodes.map((node, idx) => ({
      nodeId: node.id,
      nodeType: node.type,
      title: node.data.label,
      status: 'completed',
      timestamp: new Date(Date.now() + idx * 1000).toISOString(),
      details: `Executed ${node.data.label}`,
    }));
    return { success: true, steps };
  },
};

// Custom Node Components
const CustomNode = ({ data, selected }) => {
  const colors = {
    start: 'bg-green-100 border-green-500',
    task: 'bg-blue-100 border-blue-500',
    approval: 'bg-yellow-100 border-yellow-500',
    automated: 'bg-purple-100 border-purple-500',
    end: 'bg-red-100 border-red-500',
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${colors[data.nodeType] || 'bg-gray-100 border-gray-500'} ${selected ? 'ring-2 ring-blue-400' : ''} min-w-[150px]`}>
      <div className="font-semibold text-sm">{data.label}</div>
      {data.subtitle && <div className="text-xs text-gray-600 mt-1">{data.subtitle}</div>}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Node Configuration Panel
const NodeConfigPanel = ({ node, onUpdate, onClose, automations }) => {
  const [formData, setFormData] = useState(node.data.config || {});

  const handleSave = () => {
    onUpdate(node.id, formData);
    onClose();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    const customFields = formData.customFields || [];
    setFormData(prev => ({
      ...prev,
      customFields: [...customFields, { key: '', value: '' }],
    }));
  };

  const updateCustomField = (index, field, value) => {
    const customFields = [...(formData.customFields || [])];
    customFields[index][field] = value;
    setFormData(prev => ({ ...prev, customFields }));
  };

  const renderForm = () => {
    switch (node.data.nodeType) {
      case 'start':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Workflow start"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Metadata (Key-Value Pairs)</label>
              {(formData.customFields || []).map((field, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateCustomField(idx, 'key', e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    placeholder="Value"
                  />
                </div>
              ))}
              <button
                onClick={addCustomField}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus size={14} /> Add Field
              </button>
            </div>
          </>
        );

      case 'task':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Task title"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows="3"
                placeholder="Task description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <input
                type="text"
                value={formData.assignee || ''}
                onChange={(e) => updateField('assignee', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="email@company.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Custom Fields</label>
              {(formData.customFields || []).map((field, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateCustomField(idx, 'key', e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    placeholder="Value"
                  />
                </div>
              ))}
              <button
                onClick={addCustomField}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus size={14} /> Add Custom Field
              </button>
            </div>
          </>
        );

      case 'approval':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Approval step"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Approver Role</label>
              <select
                value={formData.approverRole || ''}
                onChange={(e) => updateField('approverRole', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select role</option>
                <option value="Manager">Manager</option>
                <option value="HRBP">HRBP</option>
                <option value="Director">Director</option>
                <option value="VP">VP</option>
                <option value="C-Level">C-Level</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Auto-approve Threshold</label>
              <input
                type="number"
                value={formData.autoApproveThreshold || ''}
                onChange={(e) => updateField('autoApproveThreshold', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., 1000"
              />
              <p className="text-xs text-gray-500 mt-1">Amount below which auto-approval applies</p>
            </div>
          </>
        );

      case 'automated':
        const selectedAction = automations.find(a => a.id === formData.actionId);
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Automated action"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Action</label>
              <select
                value={formData.actionId || ''}
                onChange={(e) => updateField('actionId', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select action</option>
                {automations.map(action => (
                  <option key={action.id} value={action.id}>{action.label}</option>
                ))}
              </select>
            </div>
            {selectedAction && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Action Parameters</label>
                {selectedAction.params.map(param => (
                  <div key={param} className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">{param}</label>
                    <input
                      type="text"
                      value={(formData.actionParams || {})[param] || ''}
                      onChange={(e) => updateField('actionParams', {
                        ...(formData.actionParams || {}),
                        [param]: e.target.value,
                      })}
                      className="w-full px-3 py-1 border rounded text-sm"
                      placeholder={`Enter ${param}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        );

      case 'end':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">End Message</label>
              <textarea
                value={formData.endMessage || ''}
                onChange={(e) => updateField('endMessage', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows="3"
                placeholder="Workflow completed successfully"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showSummary || false}
                  onChange={(e) => updateField('showSummary', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Show Summary</span>
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg overflow-y-auto z-50">
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
        <h3 className="font-semibold">Configure {node.data.label}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        {renderForm()}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 border px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Simulation Panel
const SimulationPanel = ({ workflow, onClose }) => {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const validateWorkflow = () => {
    const errs = [];
    const hasStart = workflow.nodes.some(n => n.data.nodeType === 'start');
    const hasEnd = workflow.nodes.some(n => n.data.nodeType === 'end');
    
    if (!hasStart) errs.push('Workflow must have a Start node');
    if (!hasEnd) errs.push('Workflow must have an End node');
    if (workflow.nodes.length === 0) errs.push('Workflow is empty');
    
    return errs;
  };

  const runSimulation = async () => {
    const errs = validateWorkflow();
    setErrors(errs);
    
    if (errs.length > 0) return;
    
    setLoading(true);
    try {
      const result = await mockAPI.simulate(workflow);
      setSimulation(result);
    } catch (error) {
      setErrors(['Simulation failed: ' + error.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Workflow Simulation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Validation Errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-700">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {!simulation && errors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <PlayCircle size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Click "Run Simulation" to test your workflow</p>
            </div>
          )}

          {simulation && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                <h4 className="font-semibold text-green-800">Simulation Successful</h4>
              </div>
              
              <h4 className="font-semibold mb-3">Execution Steps:</h4>
              <div className="space-y-3">
                {simulation.steps.map((step, idx) => (
                  <div key={idx} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{step.details}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Type: {step.nodeType} | Status: {step.status}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Step {idx + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <PlayCircle size={18} />
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App
export default function HRWorkflowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [automations, setAutomations] = useState([]);
  const nodeIdCounter = useRef(1);

  React.useEffect(() => {
    mockAPI.getAutomations().then(setAutomations);
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type) => {
    const nodeConfigs = {
      start: { label: 'Start', nodeType: 'start', config: {} },
      task: { label: 'Task', nodeType: 'task', config: {} },
      approval: { label: 'Approval', nodeType: 'approval', config: {} },
      automated: { label: 'Automated Action', nodeType: 'automated', config: {} },
      end: { label: 'End', nodeType: 'end', config: {} },
    };

    const config = nodeConfigs[type];
    const newNode = {
      id: `${type}-${nodeIdCounter.current++}`,
      type: 'custom',
      position: { x: 250, y: 100 + nodes.length * 100 },
      data: config,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeConfig = (nodeId, config) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const title = config.title || node.data.label;
          return {
            ...node,
            data: {
              ...node.data,
              label: title,
              subtitle: config.assignee || config.approverRole || '',
              config,
            },
          };
        }
        return node;
      })
    );
  };

  const exportWorkflow = () => {
    const workflow = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
  };

  const importWorkflow = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target.result);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          alert('Invalid workflow file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">HR Workflow Designer</h1>
          <p className="text-sm text-gray-600">Design and test HR workflows visually</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportWorkflow}
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <Save size={16} />
            Export
          </button>
          <label className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            Import
            <input type="file" accept=".json" onChange={importWorkflow} className="hidden" />
          </label>
          <button
            onClick={() => setShowSimulation(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <PlayCircle size={16} />
            Test Workflow
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-r p-4">
          <h3 className="font-semibold mb-3 text-gray-700">Node Types</h3>
          <div className="space-y-2">
            {[
              { type: 'start', label: 'Start Node', color: 'bg-green-500' },
              { type: 'task', label: 'Task Node', color: 'bg-blue-500' },
              { type: 'approval', label: 'Approval Node', color: 'bg-yellow-500' },
              { type: 'automated', label: 'Automated Step', color: 'bg-purple-500' },
              { type: 'end', label: 'End Node', color: 'bg-red-500' },
            ].map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="w-full text-left px-4 py-3 border rounded hover:bg-gray-50 flex items-center gap-3"
              >
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded text-xs text-gray-700">
            <p className="font-semibold mb-1">Quick Guide:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click nodes to add them</li>
              <li>Drag to connect nodes</li>
              <li>Select node to edit</li>
              <li>Test workflow when done</li>
            </ul>
          </div>
        </aside>

        <main className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </main>
      </div>

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={updateNodeConfig}
          onClose={() => setSelectedNode(null)}
          automations={automations}
        />
      )}

      {showSimulation && (
        <SimulationPanel
          workflow={{ nodes, edges }}
          onClose={() => setShowSimulation(false)}
        />
      )}
    </div>
  );
}