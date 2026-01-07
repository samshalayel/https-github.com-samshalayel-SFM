import type { Node, XYPosition } from "reactflow"
import type { NodeData } from "./types"

let nodeIdCounter = 0

export const generateNodeId = (type: string): string => {
  nodeIdCounter++
  return `${type}-${nodeIdCounter}`
}

export const createNode = ({
  type,
  position,
  id,
  displayName,
}: {
  type: string
  position: XYPosition
  id: string
  displayName?: string
}): Node<NodeData> => {
  const baseNode = {
    id,
    type,
    position,
    data: {
      label: displayName || getDefaultLabel(type),
      description: getDefaultDescription(type),
    },
  }

  if (type.startsWith("stage-")) {
    const stageNumber = Number.parseInt(type.split("-")[1])
    const { humanPercentage, aiPercentage } = getStagePercentages(stageNumber)

    return {
      ...baseNode,
      data: {
        ...baseNode.data,
        stageNumber,
        humanPercentage,
        aiPercentage,
        humanResponsibilities: [],
        aiResponsibilities: [],
        restrictions: [],
        customFields: {},
      },
    }
  }

  switch (type) {
    case "input":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          dataSource: "manual",
          sampleData: '{"example": "data"}',
        },
      }
    case "output":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          outputType: "console",
          outputFormat: "json",
        },
      }
    case "process":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          processType: "transform",
          processConfig: '{"operation": "map"}',
        },
      }
    case "conditional":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          condition: "data.value > 0",
          trueLabel: "Yes",
          falseLabel: "No",
        },
      }
    case "code":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          codeLanguage: "javascript",
          code: "// Write your code here\nfunction process(data) {\n  // Transform data\n  return data;\n}",
        },
      }
    case "email":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          emailTo: "",
          emailSubject: "Notification",
          emailBody: "Message content",
          emailFrom: "noreply@example.com",
        },
      }
    case "filter":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          filterCondition: "value > 0",
          filterField: "data",
          filterOperator: "equals",
        },
      }
    case "workflow":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          workflowId: "",
          workflowName: "Sub-workflow",
        },
      }
    case "table":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          tableName: "",
          operation: "select",
          query: "",
        },
      }
    case "conveyor":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          speed: 10,
          length: 5,
          direction: "forward",
        },
      }
    case "assembly":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          assemblyType: "robotic",
          cycleTime: 30,
          components: "Part A, Part B",
        },
      }
    case "quality":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          inspectionType: "all",
          rejectThreshold: 5,
          inspectionCriteria: "Visual, Dimensional, Functional",
        },
      }
    case "packaging":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          packagingType: "box",
          packagingMaterial: "Cardboard",
          unitsPerPackage: 10,
        },
      }
    case "sorting":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          sortCriteria: "size",
          sortDirections: 3,
        },
      }
    case "cutting":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          cuttingMethod: "laser",
          cutDimensions: "100x50mm",
          precision: 0.1,
        },
      }
    case "painting":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          coatingType: "spray",
          color: "Blue",
          layers: 2,
        },
      }
    case "testing":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          testType: "durability",
          testDuration: 60,
          passRate: 95,
        },
      }
    case "storage":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          capacity: 1000,
          storageType: "warehouse",
          temperature: 20,
        },
      }
    case "raw-material":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          materialType: "Steel",
          quantity: 100,
          supplier: "Supplier A",
        },
      }
    default:
      return baseNode
  }
}

const getDefaultLabel = (type: string): string => {
  switch (type) {
    case "input":
      return "Input"
    case "output":
      return "Output"
    case "process":
      return "Process"
    case "conditional":
      return "Conditional"
    case "code":
      return "Code"
    case "email":
      return "Email"
    case "filter":
      return "Filter"
    case "workflow":
      return "Sub-workflow"
    case "table":
      return "Table"
    case "conveyor":
      return "Conveyor Belt"
    case "assembly":
      return "Assembly Station"
    case "quality":
      return "Quality Control"
    case "packaging":
      return "Packaging"
    case "sorting":
      return "Sorting"
    case "cutting":
      return "Cutting/Machining"
    case "painting":
      return "Painting/Coating"
    case "testing":
      return "Testing"
    case "storage":
      return "Storage"
    case "raw-material":
      return "Raw Material"
    default:
      return "Node"
  }
}

const getDefaultDescription = (type: string): string => {
  if (type.startsWith("stage-")) {
    const stageNumber = Number.parseInt(type.split("-")[1])
    const stageDescriptions = [
      "Define the real problem and context", // Stage 0
      "Define product vision and MVP boundaries", // Stage 1
      "Map architectural elements and decisions", // Stage 2
      "Deliver functional incremental slices", // Stage 3
      "Define QA and incident management", // Stage 4
      "Unify governance and automation", // Stage 5
      "Complete production deployment", // Stage 6
    ]
    return stageDescriptions[stageNumber] || "Development stage"
  }

  switch (type) {
    case "input":
      return "Data input node"
    case "output":
      return "Data output node"
    case "process":
      return "Data processing node"
    case "conditional":
      return "Conditional branching"
    case "code":
      return "Custom code execution"
    case "email":
      return "Send email notification"
    case "filter":
      return "Filter data"
    case "workflow":
      return "Nested workflow"
    case "table":
      return "Database table operation"
    case "conveyor":
      return "Material transport"
    case "assembly":
      return "Component assembly"
    case "quality":
      return "Inspection & testing"
    case "packaging":
      return "Product packaging"
    case "sorting":
      return "Material sorting"
    case "cutting":
      return "Material cutting"
    case "painting":
      return "Surface coating"
    case "testing":
      return "Product testing"
    case "storage":
      return "Material storage"
    case "raw-material":
      return "Material input"
    default:
      return "Workflow node"
  }
}

const getStagePercentages = (stageNumber: number): { humanPercentage: number; aiPercentage: number } => {
  const percentages = [
    { humanPercentage: 95, aiPercentage: 5 }, // Stage 0: Problem
    { humanPercentage: 80, aiPercentage: 20 }, // Stage 1: Product Shape
    { humanPercentage: 60, aiPercentage: 40 }, // Stage 2: Architecture
    { humanPercentage: 40, aiPercentage: 60 }, // Stage 3: Production
    { humanPercentage: 30, aiPercentage: 70 }, // Stage 4: Observability
    { humanPercentage: 20, aiPercentage: 80 }, // Stage 5: Reproducibility
    { humanPercentage: 15, aiPercentage: 85 }, // Stage 6: Production Ready
  ]

  return percentages[stageNumber] || { humanPercentage: 50, aiPercentage: 50 }
}
