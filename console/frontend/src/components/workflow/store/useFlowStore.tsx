import { cloneDeep } from 'lodash';
import { Edge, EdgeChange, Node, NodeChange, Connection } from 'reactflow';
import { create } from 'zustand';
import { NodeDataType } from '@/components/workflow/types';
import { FlowStoreType } from '../types/zustand/flow';
import {
  getNodeId,
  getEdgeId,
  getNextName,
} from '@/components/workflow/utils/reactflowUtils';
import { v4 as uuid } from 'uuid';
import {
  initialStatus,
  setZoom,
  undo,
  moveToPosition,
  setReactFlowInstance,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  setNode,
  delayCheckNode,
  checkNode,
  copyNode,
  updateNodeNameStatus,
  takeSnapshot,
  setHistorys,
  delayUpdateNodeRef,
  removeNodeRef,
  deleteNodeRef,
  onConnect,
  loadHistory,
  deleteNode,
  reNameNode,
  updateNodeRef,
  switchNodeRef,
  addIntentId,
} from './flow-function';

const paste = async (
  selection: { nodes: Node[]; edges: Edge[] },
  get: () => {
    nodes: Node[];
    setNodes: (callback: (nodes: Node[]) => Node[]) => void;
    setEdges: (edges: Edge[]) => void;
  }
): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText();
    const selection = JSON.parse(text);
    const idsMap = {};
    let newNodes: Node<NodeDataType>[] = get().nodes;
    const currentTypeNodeList = cloneDeep(get().nodes);

    newNodes = selection?.nodes.map(item => {
      const currentTypeList = currentTypeNodeList.filter(
        node =>
          node.data?.label?.split('_')?.[0] ===
          item.data?.label?.split('_')?.[0]
      );
      const newId = getNodeId(item.id?.split('::')?.[0]);
      idsMap[item.id] = newId;
      item.data.label = getNextName(
        currentTypeList,
        item.data?.label?.split('_')?.[0]
      );
      item.data.inputs = item.data.inputs?.map(input => ({
        id: uuid(),
        name: input?.name,
        required: input?.required,
        type: input?.type,
        schema: {
          type: 'string',
          value: {
            type: input?.schema?.value?.type,
            content:
              input?.schema?.value?.type === 'literal'
                ? input?.schema?.value?.content
                : {},
          },
        },
      }));
      item.data.references = [];
      item.data.shrink = false;
      currentTypeNodeList.push(item);
      const newItem = {
        ...item,
        id: newId,
        position: {
          x: item.position.x + 50,
          y: item.position.y + 50,
        },
        selected: true,
      };
      if (item?.parentId) {
        newItem.parentId = idsMap[item.parentId];
      }
      if (item?.data?.parentId) {
        newItem.data.parentId = idsMap[item.parentId];
      }
      return newItem;
    });
    get().setNodes(old => {
      return cloneDeep([
        ...old.map(item => ({ ...item, selected: false })),
        ...newNodes,
      ]);
    });
    const newEdges = selection.edges
      ?.filter(edge => idsMap[edge.target] && idsMap[edge.source])
      ?.map(edge => ({
        ...edge,
        id: getEdgeId(idsMap[edge.target], idsMap[edge.source]),
        target: idsMap[edge.target],
        source: idsMap[edge.source],
        selected: false,
      }));

    get().setEdges(oldEdges => cloneDeep([...oldEdges, ...newEdges]));

    setTimeout(() => {
      newNodes.forEach(item => {
        get().updateNodeRef(item.id);
      });
    }, 500);
  } catch {
    return;
  }
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useFlowStore = create<FlowStoreType>((set, get) => ({
  ...initialStatus,
  flowState: undefined,
  reactFlowInstance: null,
  setZoom: (zoom: number): void => setZoom(zoom, set),
  undo: (): void => undo(get),
  takeSnapshot: (): void => takeSnapshot(get),
  setHistorys: (change: unknown): void => setHistorys(change, get, set),
  moveToPosition: (viewport: unknown): void => moveToPosition(viewport, get),
  setReactFlowInstance: (newState: unknown): void =>
    setReactFlowInstance(newState, set),
  onNodesChange: (changes: NodeChange[]): void =>
    onNodesChange(changes, get, set),
  onEdgesChange: (changes: EdgeChange[]): void =>
    onEdgesChange(changes, get, set),
  setNodes: (change: unknown): void => setNodes(change, get, set),
  setEdges: (change: unknown): void => setEdges(change, get, set),
  setNode: (id: string, change: Node | ((oldState: Node) => Node)): void =>
    setNode(id, change, get, set),
  delayCheckNode: (nodeId: string): void => delayCheckNode(nodeId, get, set),
  checkNode: (nodeId: string): boolean => checkNode(nodeId, get),
  copyNode: (nodeId: string): void => copyNode(nodeId, get),
  deleteNode: (nodeId: string): void => deleteNode(nodeId, get),
  updateNodeNameStatus: (
    nodeId: string,
    labelInputId: string | undefined
  ): void => updateNodeNameStatus(nodeId, labelInputId, get),
  reNameNode: (nodeId: string, value: string): void =>
    reNameNode(nodeId, value, get),
  paste: (selection: { nodes: Node[]; edges: Edge[] }): void =>
    paste(selection, get),
  updateNodeRef: (id: string): void => updateNodeRef(id, get),
  delayUpdateNodeRef: (id: string): void => delayUpdateNodeRef(id, get),
  removeNodeRef: (
    souceId: string,
    targetId: string,
    inputEdges?: Edge[]
  ): void => removeNodeRef(souceId, targetId, inputEdges, get),
  deleteNodeRef: (id: string, outputId: string): void =>
    deleteNodeRef(id, outputId, get),
  switchNodeRef: (connection: Connection, oldEdge: Edge, get): void =>
    switchNodeRef(connection, oldEdge, get),
  addIntentId: (connection: Edge): void => addIntentId(connection, get),
  onConnect: (connection: Connection): void => onConnect(connection, get),
  loadHistory: (nodes: Node[], edges: Edge[]): void =>
    loadHistory(nodes, edges, set),
}));

export default useFlowStore;
