import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Type, Box, Square, Layout, FileText, Package, Layers, ChevronRight, ChevronDown, Search, Filter, ChevronLeft, Plus, MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import { DesignState, FrameNode, NodeId } from '../types';

interface LayersPanelProps {
  state: DesignState;
  onSelect: (id: string) => void;
  onStateChange?: (updater: (prev: DesignState) => DesignState) => void;
  fileMenuOpen?: boolean;
  onFileMenuToggle?: () => void;
  onComponentDragStart?: (componentId: string) => void;
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ state, onSelect, onStateChange, fileMenuOpen, onFileMenuToggle, onComponentDragStart, onAddPage, onDeletePage }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'assets'>('file');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pages', 'layers']));
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(208); // w-52 = 208px
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(state.projectName || 'Untitled');
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);
  const [editNodeNameValue, setEditNodeNameValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<NodeId | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<NodeId | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<NodeId>>(new Set());
  
  // Auto-expand frames with children on mount
  useEffect(() => {
    const framesWithChildren = Object.values(state.nodes)
      .filter(node => {
        const isFrame = node.type === 'FRAME' || node.type === 'COMPONENT';
        if (isFrame) {
          const frame = node as FrameNode;
          return frame.children.length > 0;
        }
        return false;
      })
      .map(node => node.id);
    
    setExpandedNodes(new Set(framesWithChildren));
  }, []); // Only run on mount

  // Helper function to get absolute position of a node
  const getAbsolutePosition = (nodeId: NodeId, nodes: Record<string, any>): { x: number; y: number } => {
    const node = nodes[nodeId];
    if (!node) return { x: 0, y: 0 };
    let x = node.x;
    let y = node.y;
    let current = node;
    while (current.parent) {
      const parent = nodes[current.parent];
      if (!parent) break;
      x += parent.x;
      y += parent.y;
      current = parent;
    }
    return { x, y };
  };

  // Update edit value when project name changes
  useEffect(() => {
    setEditNameValue(state.projectName || 'Untitled');
  }, [state.projectName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Resize handler
  const handleResize = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startWidth = panelWidth;
    
    const onMove = (moveEvent: PointerEvent) => {
      const diff = moveEvent.clientX - startX; // Positive because we're resizing from left
      const newWidth = Math.max(208, Math.min(600, startWidth + diff)); // Min 208px, Max 600px
      setPanelWidth(newWidth);
    };
    
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const toggleNodeExpanded = (nodeId: NodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Recursive function to render a node and its children
  const renderNode = (nodeId: NodeId, depth: number = 0): React.ReactNode => {
    const node = state.nodes[nodeId];
    if (!node) return null;

    const isFrame = node.type === 'FRAME' || node.type === 'COMPONENT';
    const frameNode = isFrame ? (node as FrameNode) : null;
    const hasChildren = frameNode && frameNode.children.length > 0;
    const isExpanded = expandedNodes.has(nodeId);
    const indent = depth * 16; // 16px per level of nesting

    // Filter by search query
    if (searchQuery.trim() && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      // If this node doesn't match, check if any children do
      if (hasChildren) {
        const matchingChildren = frameNode!.children.filter(childId => {
          const child = state.nodes[childId];
          return child && child.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
        if (matchingChildren.length === 0) return null;
      } else {
        return null;
      }
    }

    return (
      <div key={nodeId}>
        <div 
          draggable
          onDragStart={(e) => {
            setDraggedNodeId(nodeId);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverNodeId(nodeId);
          }}
          onDragLeave={() => {
            setDragOverNodeId(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedNodeId && draggedNodeId !== nodeId && onStateChange) {
              const draggedNode = state.nodes[draggedNodeId];
              const targetNode = state.nodes[nodeId];
              
              if (!draggedNode || !targetNode) {
                setDraggedNodeId(null);
                setDragOverNodeId(null);
                return;
              }
              
              // Check if target is a FRAME or COMPONENT that can have children
              if ((targetNode.type === 'FRAME' || targetNode.type === 'COMPONENT')) {
                const targetFrame = targetNode as FrameNode;
                
                // Don't allow dropping a node onto itself or its own descendant
                if (draggedNodeId === nodeId) {
                  setDraggedNodeId(null);
                  setDragOverNodeId(null);
                  return;
                }
                
                // Check if dragged node is a descendant of target (prevent circular reference)
                let isDescendant = false;
                let current: any = draggedNode;
                while (current.parent) {
                  if (current.parent === nodeId) {
                    isDescendant = true;
                    break;
                  }
                  current = state.nodes[current.parent];
                  if (!current) break;
                }
                
                if (isDescendant) {
                  setDraggedNodeId(null);
                  setDragOverNodeId(null);
                  return;
                }
                
                // Remove from old parent
                const newNodes = { ...state.nodes };
                let newRootIds = [...state.rootIds];
                
                if (draggedNode.parent) {
                  const oldParent = newNodes[draggedNode.parent] as FrameNode;
                  if (oldParent) {
                    newNodes[draggedNode.parent] = {
                      ...oldParent,
                      children: oldParent.children.filter(cid => cid !== draggedNodeId)
                    } as FrameNode;
                  }
                } else {
                  // Remove from rootIds if it was a root
                  newRootIds = newRootIds.filter(rid => rid !== draggedNodeId);
                }
                
                // Add to new parent
                const absPos = getAbsolutePosition(nodeId, newNodes);
                newNodes[nodeId] = {
                  ...targetFrame,
                  children: [...targetFrame.children, draggedNodeId]
                } as FrameNode;
                
                // Update dragged node's parent and position (relative to new parent)
                const draggedAbsPos = getAbsolutePosition(draggedNodeId, state.nodes);
                newNodes[draggedNodeId] = {
                  ...draggedNode,
                  parent: nodeId,
                  x: draggedAbsPos.x - absPos.x,
                  y: draggedAbsPos.y - absPos.y
                } as any;
                
                onStateChange((p: DesignState) => ({
                  ...p,
                  nodes: newNodes,
                  rootIds: newRootIds
                }));
              } else {
                // Original behavior: reorder rootIds (only if both are root nodes)
                const currentRootIds = [...state.rootIds];
                const draggedIndex = currentRootIds.indexOf(draggedNodeId);
                const targetIndex = currentRootIds.indexOf(nodeId);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                  currentRootIds.splice(draggedIndex, 1);
                  currentRootIds.splice(targetIndex, 0, draggedNodeId);
                  
                  onStateChange((p: DesignState) => ({
                    ...p,
                    rootIds: currentRootIds
                  }));
                }
              }
            }
            setDraggedNodeId(null);
            setDragOverNodeId(null);
          }}
          onClick={() => onSelect(nodeId)} 
          className={`flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer border-l-2 rounded ${
            state.selection.includes(nodeId) 
              ? (state.mode === 'DEV' 
                  ? 'bg-green-900/30 border-green-500 text-white' 
                  : 'bg-blue-900/30 border-blue-500 text-white') 
              : 'border-transparent hover:bg-gray-700 text-gray-400'
          } ${dragOverNodeId === nodeId ? 'bg-gray-600' : ''} ${draggedNodeId === nodeId ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${8 + indent}px` }}
        >
          {/* Chevron for expandable nodes */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpanded(nodeId);
              }}
              className="shrink-0 p-0.5 hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={12} className="text-gray-400" />
              ) : (
                <ChevronRight size={12} className="text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-4 shrink-0" /> // Spacer for alignment
          )}
          
          {node.type === 'IMAGE' && <ImageIcon size={12} className="shrink-0" />}
          {node.type === 'TEXT' && <Type size={12} className="shrink-0" />}
          {node.type === 'FRAME' && ((node as FrameNode).layoutMode !== 'NONE' ? <Layout size={12} className="shrink-0" /> : <Box size={12} className="shrink-0" />)}
          {node.type === 'RECTANGLE' && <Square size={12} className="shrink-0" />}
          {node.type === 'COMMENT' && <MessageSquare size={12} className="shrink-0" />}
          {editingNodeId === nodeId ? (
            <input
              value={editNodeNameValue}
              onChange={(e) => setEditNodeNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNodeNameSave();
                if (e.key === 'Escape') handleNodeNameCancel();
              }}
              onBlur={handleNodeNameSave}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="flex-1 px-1 py-0.5 text-xs bg-gray-800 border border-blue-500 rounded outline-none text-gray-300"
            />
          ) : (
            <span 
              className="truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleNodeNameDoubleClick(nodeId);
              }}
            >
              {node.name}
            </span>
          )}
        </div>
        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {frameNode!.children.map(childId => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find all components (master components)
  const components = Object.values(state.nodes).filter(n => n.type === 'COMPONENT' || (n.type === 'FRAME' && (n as any).isComponent));

  const handleNameSave = () => {
    if (onStateChange) {
      onStateChange((p: DesignState) => ({ ...p, projectName: editNameValue || 'Untitled' }));
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditNameValue(state.projectName || 'Untitled');
    setIsEditingName(false);
  };

  const handleNodeNameSave = () => {
    if (editingNodeId && onStateChange) {
      onStateChange((p: DesignState) => ({
        ...p,
        nodes: {
          ...p.nodes,
          [editingNodeId]: { ...p.nodes[editingNodeId], name: editNodeNameValue || p.nodes[editingNodeId].name }
        }
      }));
    }
    setEditingNodeId(null);
    setEditNodeNameValue('');
  };

  const handleNodeNameCancel = () => {
    setEditingNodeId(null);
    setEditNodeNameValue('');
  };

  const handleNodeNameDoubleClick = (nodeId: NodeId) => {
    const node = state.nodes[nodeId];
    if (node) {
      setEditingNodeId(nodeId);
      setEditNodeNameValue(node.name);
    }
  };

  const handleProjectNameMenuAction = (actionId: string) => {
    // Handle dropdown actions
    switch (actionId) {
      case 'version':
        // Show version history (future implementation)
        console.log('Show version history');
        break;
      case 'export':
        // Export file (future implementation)
        console.log('Export');
        break;
      case 'sidebar':
        // Add to sidebar (future implementation)
        console.log('Add to sidebar');
        break;
      case 'branch':
        // Create branch (future implementation)
        console.log('Create branch');
        break;
    }
  };

  const projectNameDropdownOptions = [
    { id: 'version', label: 'Show version history' },
    { id: 'export', label: 'Export' },
    { id: 'sidebar', label: 'Add to sidebar' },
    { id: 'branch', label: 'Create branch' },
  ];

  // Handle panel collapse
  if (isCollapsed) {
    return (
      <div className="flex border-r border-black shrink-0" style={{ width: '40px' }}>
        <div className="bg-[#2c2c2c] flex flex-col items-center py-2 gap-2">
          {/* File Icon Button */}
          {onFileMenuToggle && (
            <button
              onClick={onFileMenuToggle}
              className="p-2 text-gray-400 hover:text-white rounded"
              title="File"
            >
              <FileText size={16} />
            </button>
          )}
          {/* Expand button */}
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-gray-400 hover:text-white rounded"
            title="Expand panel"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex border-r border-black shrink-0 relative" style={{ width: `${panelWidth}px` }}>
      <div ref={panelRef} className="bg-[#2c2c2c] flex flex-col shrink-0 relative" style={{ width: `${panelWidth}px` }}>
        {/* Collapse Button - Top right corner */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-white rounded"
          title="Collapse panel"
        >
          <ChevronLeft size={14} />
        </button>
        
        {/* File Button - Top left when expanded */}
        {onFileMenuToggle && (
          <button
            onClick={onFileMenuToggle}
            className="absolute top-4 left-4 z-10 p-1.5 text-gray-400 hover:text-white rounded"
            title="File"
          >
            <FileText size={14} />
          </button>
        )}
        
        {/* Top spacing to avoid file button overlap */}
        <div className="h-16 shrink-0"></div>
        
        <div className="flex-1 overflow-y-auto">
        {/* Project Name Section - Above tabs */}
        <div className="px-3 pt-1.5 pb-2 space-y-1.5 border-b border-gray-700/50">
          {/* Editable Project Name with Dropdown */}
          <div className="px-2 flex items-center gap-1">
            {isEditingName ? (
              <input
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') handleNameCancel();
                }}
                onBlur={handleNameSave}
                autoFocus
                className="flex-1 px-2 py-1 text-xs font-medium bg-gray-800 border border-blue-500 rounded outline-none text-gray-300"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex-1 px-2 py-1 text-xs text-gray-300 font-medium hover:bg-gray-700 rounded text-left"
              >
                {state.projectName || 'Untitled'}
              </button>
            )}
            
            {/* Project Name Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1 text-gray-500 hover:text-white rounded"
                title="File options"
              >
                <ChevronDown size={12} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[180px] py-1 z-50">
                  {projectNameDropdownOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        handleProjectNameMenuAction(option.id);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="px-2 py-0.5 text-[10px] text-gray-500">Drafts • Free</div>
          
          {/* Ready for development status (Dev Mode only) */}
          {state.mode === 'DEV' && (
            <div className="px-2 py-0.5 text-[10px] text-green-500">Ready for development</div>
          )}
        </div>

        {/* Section Divider */}
        <div className="border-b border-gray-700/50"></div>

        {/* File/Assets Tabs with Search */}
        <div className="border-b border-gray-700/50">
          <div className="flex items-center">
            <div className="flex flex-1">
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 px-3 py-2 text-[11px] font-medium text-center border-b-2 transition-colors ${
                  activeTab === 'file'
                    ? 'text-white border-blue-500 bg-gray-800/30'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                File
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`flex-1 px-3 py-2 text-[11px] font-medium text-center border-b-2 transition-colors ${
                  activeTab === 'assets'
                    ? 'text-white border-blue-500 bg-gray-800/30'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                Assets
              </button>
            </div>
            {/* Search - Icon that expands when clicked */}
            <div className="px-2 flex items-center">
              {searchExpanded ? (
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery.trim()) {
                        setSearchExpanded(false);
                      }
                    }}
                    autoFocus
                    className="w-32 pl-7 pr-2 py-1 text-xs bg-gray-800/50 border border-gray-600 rounded text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="p-1.5 text-gray-400 hover:text-white rounded"
                  title="Search"
                >
                  <Search size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'file' && (
          <div className="px-3 py-2.5">
            {/* File tab content - project info already shown above */}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="px-3 py-2.5 border-b border-gray-700/50">
            {state.mode === 'DEV' ? (
              // Dev Mode: Show assets with thumbnails
              components.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center shrink-0">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {components.map(comp => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center shrink-0">
                        <Package size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-gray-300 truncate">{comp.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">Component</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Design Mode: Show components list
              components.length === 0 ? (
                <div className="px-2 py-6 text-xs text-gray-500 text-center">
                  No components yet
                  <div className="text-[10px] mt-1.5 text-gray-600">Create a component to see it here</div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {components.map(comp => (
                    <div
                      key={comp.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'copy';
                        e.dataTransfer.setData('text/plain', comp.id);
                        if (onComponentDragStart) {
                          onComponentDragStart(comp.id);
                        }
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700 rounded cursor-move"
                    >
                      <Package size={12} />
                      <span className="truncate">{comp.name}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Pages Section */}
        <div className="border-b border-gray-700/50">
          <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-700/30">
            <button
              onClick={() => toggleSection('pages')}
              className="flex-1 text-left"
            >
              <span className="text-[11px] font-medium text-gray-300">Pages</span>
            </button>
            {/* Add Page Button - Top right of Pages section */}
            <button
              onClick={() => {
                if (onAddPage) {
                  onAddPage();
                }
              }}
              className="p-1 text-gray-400 hover:text-white rounded"
              title="Add page"
            >
              <Plus size={12} />
            </button>
          </div>
          {expandedSections.has('pages') && (
            <div className="px-3 pb-2.5 space-y-0.5">
              {state.rootIds
                .map(id => state.nodes[id])
                .filter(node => node && (node.type === 'FRAME' || node.type === 'COMPONENT'))
                .map((page, index) => {
                  const isSelected = state.selection.includes(page.id);
                  const isEditing = editingNodeId === page.id;
                  
                  const pages = state.rootIds.filter(id => {
                    const node = state.nodes[id];
                    return node && (node.type === 'FRAME' || node.type === 'COMPONENT');
                  });
                  const canDelete = pages.length > 1;
                  
                  return (
                    <div
                      key={page.id}
                      className={`px-2 py-1.5 text-xs rounded cursor-pointer group flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                      onClick={() => onSelect(page.id)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleNodeNameDoubleClick(page.id);
                      }}
                    >
                      {isEditing ? (
                        <input
                          value={editNodeNameValue}
                          onChange={(e) => setEditNodeNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNodeNameSave();
                            if (e.key === 'Escape') handleNodeNameCancel();
                          }}
                          onBlur={handleNodeNameSave}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="w-full px-2 py-0.5 bg-gray-800 border border-blue-500 rounded outline-none text-gray-300"
                        />
                      ) : (
                        <>
                          <span className="truncate flex-1">{page.name}</span>
                          {canDelete && onDeletePage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePage(page.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-opacity"
                              title="Delete page"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Layers Section */}
        <div className="border-b border-gray-700/50">
          <button
            onClick={() => toggleSection('layers')}
            className="w-full px-3 py-2 hover:bg-gray-700/30 text-left"
          >
            <span className="text-[11px] font-medium text-gray-300">Layers</span>
          </button>
          {expandedSections.has('layers') && (
            <div className="px-3 pb-2.5">
              {/* Note: Search is now in the tab row above, this section removed for cleaner UI */}

              {/* Layers List */}
              <div className="space-y-0.5">
                {state.rootIds.map(id => renderNode(id, 0))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      {/* Resize Handle */}
      <div 
        onPointerDown={handleResize}
        className="w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors shrink-0"
        title="Drag to resize"
      />
    </div>
  );
};

