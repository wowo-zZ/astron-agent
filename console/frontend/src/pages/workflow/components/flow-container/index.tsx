import React, { useCallback, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Edge,
  NodeDragHandler,
  OnSelectionChangeParams,
  ReactFlowInstance,
  updateEdge,
} from 'reactflow';
import { useFlowCommon } from '@/components/workflow/hooks/useFlowCommon';
import ConnectionLineComponent from '@/components/workflow/nodes/components/connection-line';
import FlowPanel from '@/components/workflow/panel';
import useFlowsManager from '@/components/workflow/store/useFlowsManager';
import useFlowStore from '@/components/workflow/store/useFlowStore';
import SelectNode from '@/components/workflow/tips/select-node';

import CustomNode from '@/components/workflow/nodes';
import CustomEdge from '@/components/workflow/edges';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

interface IndexProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

function Index({ zoom, setZoom }: IndexProps): React.ReactElement {
  // hooks
  const { handleAddNode } = useFlowCommon();
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const [lastSelection, setLastSelection] =
    useState<OnSelectionChangeParams | null>(null);

  const nodes = useFlowStore(state => state.nodes);
  const edges = useFlowStore(state => state.edges);
  const reactFlowInstance = useFlowStore(state => state.reactFlowInstance);
  const onNodesChange = useFlowStore(state => state.onNodesChange);
  const onEdgesChange = useFlowStore(state => state.onEdgesChange);
  const setEdges = useFlowStore(state => state.setEdges);
  const onConnect = useFlowStore(state => state.onConnect);
  const takeSnapshot = useFlowStore(state => state.takeSnapshot);
  const switchNodeRef = useFlowStore(state => state.switchNodeRef);
  const setReactFlowInstance = useFlowStore(
    state => state.setReactFlowInstance
  );
  const autoSaveCurrentFlow = useFlowsManager(
    state => state.autoSaveCurrentFlow
  );
  const canvasesDisabled = useFlowsManager(state => state.canvasesDisabled);
  const controlMode = useFlowsManager(state => state.controlMode);
  const willAddNode = useFlowsManager(state => state.willAddNode);

  // =========================
  // 拆分函数：初始化 ReactFlow
  // =========================
  const handleFlowInit = useCallback(
    (instance: ReactFlowInstance): void => {
      setReactFlowInstance(instance);
      instance.fitView();
      const zoomLevel = instance.getViewport()?.zoom
        ? Math.round(instance.getViewport().zoom * 100)
        : 80;
      setZoom(zoomLevel);
    },
    [setReactFlowInstance, setZoom]
  );

  // =========================
  // 拆分函数：处理拖拽放置
  // =========================
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void =>
    event.preventDefault();

  const handleDropAllowed = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!willAddNode || !dropZoneRef.current || !reactFlowInstance) return;

    const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
    const x = event.clientX - dropZoneRect.left;
    const y = event.clientY - dropZoneRect.top;
    const viewPoint = reactFlowInstance.getViewport();
    const zoomFactor = 1 / viewPoint.zoom;

    handleAddNode(willAddNode, {
      x: (x - viewPoint.x) * zoomFactor,
      y: (y - viewPoint.y) * zoomFactor,
    });
  };

  // =========================
  // 拆分函数：节点拖拽
  // =========================
  const onNodeDragStart: NodeDragHandler = useCallback(
    () => takeSnapshot(false),
    [takeSnapshot]
  );

  const onNodeDragStop = useCallback(
    () => autoSaveCurrentFlow(),
    [autoSaveCurrentFlow]
  );

  // =========================
  // 拆分函数：选择变化
  // =========================
  const onSelectionChange = useCallback(
    (flow: OnSelectionChangeParams): void => {
      setLastSelection(flow);
    },
    []
  );

  // =========================
  // 拆分函数：边更新
  // =========================
  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection): void => {
      const isExistEdge = edges?.some(
        item =>
          item.target === newConnection.target &&
          item.source === newConnection.source
      );
      if (!isExistEdge) {
        switchNodeRef({ ...newConnection }, { ...oldEdge });
        setEdges(els => updateEdge(oldEdge, newConnection, els));
      }
    },
    [edges, setEdges, switchNodeRef]
  );

  const canUseCanvases = useMemo(() => !canvasesDisabled, [canvasesDisabled]);

  // =========================
  // JSX
  // =========================
  return (
    <div
      className="relative flex-1 h-full"
      onDragOver={handleDragOver}
      onDrop={handleDropAllowed}
      ref={dropZoneRef}
      id="flow-container"
    >
      {lastSelection?.nodes?.length && lastSelection.nodes.length > 1 ? (
        <SelectNode lastSelection={lastSelection} />
      ) : null}
      <ReactFlow
        nodes={nodes?.filter(node => !node.hidden)}
        edges={edges}
        onInit={handleFlowInit}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onEdgeUpdate={onEdgeUpdate}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes as unknown}
        panOnDrag={controlMode === 'mouse'}
        selectionOnDrag={controlMode === 'touch'}
        nodesDraggable={canUseCanvases}
        nodesConnectable={canUseCanvases}
        elementsSelectable={canUseCanvases}
        deleteKeyCode={[]}
        multiSelectionKeyCode="Shift"
        panOnScroll={controlMode === 'touch'}
        connectionLineComponent={ConnectionLineComponent}
        onlyRenderVisibleElements
      >
        <Background />
        <FlowPanel
          reactFlowInstance={reactFlowInstance}
          zoom={zoom}
          setZoom={setZoom}
          historys={[]}
        />
      </ReactFlow>
    </div>
  );
}

export default Index;
