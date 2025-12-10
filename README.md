HR Workflow Designer

A visual workflow designer for HR processes, built with React and React Flow. This prototype helps HR teams create and test internal workflows such as onboarding, leave approvals, and document verification.


Features


Core Capabilities

Drag-and-drop workflow canvas using React Flow

Five node types: Start, Task, Approval, Automated Action, End

Node-specific configuration panels with validation

Mock API layer for automated actions

Workflow simulation with step-by-step execution

Import and export workflows as JSON


Node Types

Start Node: Workflow entry point with title and metadata

Task Node: Human-driven tasks (title, description, assignee, due date, custom fields)

Approval Node: Manager or HR approvals with role selection and auto-approve thresholds

Automated Step Node: System-triggered actions with dynamic parameters

End Node: Workflow completion with optional summary message



Architecture Overview

Folder Structure (simplified)

components/ – Canvas, nodes, configuration panels, simulation

hooks/ – Custom React hooks

services/ – Mock API functions

types/ – TypeScript interfaces

utils/ – Helper utilities


Key Design Choices

Component Architecture

Modular separation of canvas, nodes, configuration, and simulation

Reusable configuration panel

Components follow single-responsibility principles

State Management

React Flow state hooks for nodes and edges

Local UI state for interactions

Centralized updates for node configuration


Mock API Layer

Simulated async actions

Extensible action definitions

Easy to integrate with real backend later


Form Handling

Dynamic forms based on node type

Validation and controlled components

Type-safe configuration objects


Scalability

Easy to add new node types

Clean separation of data and UI

Extensible automation actions


Installation

Requirements: Node.js 18+
Setup:

git clone https://github.com/yourusername/hr-workflow-designer.git
cd hr-workflow-designer
npm install
npm run dev


Runs at: http://localhost:5173

Usage

Creating a Workflow

Add nodes from the left panel

Connect nodes by dragging between handles

Select a node to configure it

Simulate workflow execution

Export or import as JSON

Node Configuration Examples

Task Node:

{
  "title": "Collect Employee Documents",
  "description": "Employee needs to upload ID and certificates",
  "assignee": "hr@company.com",
  "dueDate": "2025-01-15",
  "customFields": [
    { "key": "priority", "value": "high" },
    { "key": "department", "value": "HR" }
  ]
}


Approval Node:

{
  "title": "Manager Approval",
  "approverRole": "Manager",
  "autoApproveThreshold": 5000
}


Automated Step Node:

{
  "title": "Send Welcome Email",
  "actionId": "send_email",
  "actionParams": {
    "to": "{{employee.email}}",
    "subject": "Welcome to the team!",
    "body": "Welcome email template..."
  }
}

Mock API

Available Actions

[
  {
    "id": "send_email",
    "label": "Send Email",
    "params": ["to", "subject", "body"]
  },
  {
    "id": "generate_doc",
    "label": "Generate Document",
    "params": ["template", "recipient"]
  }
]


Simulation Endpoint

{
  "success": true,
  "steps": [
    {
      "nodeId": "start-1",
      "nodeType": "start",
      "title": "Start Onboarding",
      "status": "completed",
      "timestamp": "2025-12-10T10:00:00Z",
      "details": "Executed Start Onboarding"
    }
  ]
}

Requirements Checklist

Completed

React Flow drag-and-drop canvas

Five custom node types

Node configuration forms

Dynamic fields

Mock API and simulation

Workflow validation

Import/export JSON

Mini-map and zoom controls

Clear component structure and custom hooks

Pending (not implemented due to time)

Node templates

Undo/redo

Auto-layout



Tech Stack

React 18

React Flow

Tailwind CSS

Lucide React

Vite


Development Notes

Time spent: around 4–5 hours
Breakdown:

Canvas and nodes: 1 hour

Configuration forms: 1.5 hours

Mock API and simulation: 1 hour

UI polishing: 1 hour

Documentation: 0.5 hours
