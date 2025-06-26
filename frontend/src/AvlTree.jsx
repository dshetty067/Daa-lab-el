import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Enhanced Node component with better visual design
const Node = ({ node, highlight, depth = 0, position = 'root' }) => {
  if (!node) return null;
  const isHighlighted = highlight?.includes(node.value);

  return (
    <div className="flex flex-col items-center relative">
      {/* Connection lines */}
      {position !== 'root' && (
        <div 
          className={`absolute -top-8 w-px h-8 bg-gradient-to-b from-slate-400 to-transparent`}
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
      )}
      
      {/* Node circle */}
      <div className="relative">
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center font-bold text-white 
            transition-all duration-500 transform hover:scale-110 shadow-lg
            ${isHighlighted 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse shadow-yellow-300' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
            }
          `}
        >
          <span className="text-lg">{node.value}</span>
        </div>
        
        {/* Depth indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <span className="text-xs bg-slate-600 text-white px-2 py-1 rounded-full">
            D:{depth}
          </span>
        </div>

        {/* Balance factor indicator */}
        {node.balanceFactor !== undefined && (
          <div className="absolute -top-2 -right-2">
            <span className={`
              text-xs px-2 py-1 rounded-full font-semibold
              ${Math.abs(node.balanceFactor) > 1 
                ? 'bg-red-500 text-white animate-bounce' 
                : 'bg-blue-500 text-white'
              }
            `}>
              BF:{node.balanceFactor}
            </span>
          </div>
        )}
      </div>

      {/* Children container */}
      {(node.left || node.right) && (
        <div className="flex justify-center mt-12 relative" style={{ minWidth: '200px' }}>
          {/* Horizontal connector line */}
          {node.left && node.right && (
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-400" />
          )}
          
          <div className="flex justify-between w-full">
            <div className="flex-1 flex justify-center">
              {node.left && (
                <>
                  <div className="absolute left-1/4 top-0 w-px h-4 bg-slate-400" />
                  <Node 
                    node={node.left} 
                    highlight={highlight} 
                    depth={depth + 1} 
                    position="left"
                  />
                </>
              )}
            </div>
            
            <div className="flex-1 flex justify-center">
              {node.right && (
                <>
                  <div className="absolute right-1/4 top-0 w-px h-4 bg-slate-400" />
                  <Node 
                    node={node.right} 
                    highlight={highlight} 
                    depth={depth + 1} 
                    position="right"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tree Statistics Component
const TreeStats = ({ tree, theoreticalHeight }) => {
  const calculateActualDepth = (node, depth = 0) => {
    if (!node) return depth - 1;
    return Math.max(
      calculateActualDepth(node.left, depth + 1),
      calculateActualDepth(node.right, depth + 1)
    );
  };

  const countNodes = (node) => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  const actualDepth = tree ? calculateActualDepth(tree) : 0;
  const nodeCount = tree ? countNodes(tree) : 0;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
        Tree Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">{nodeCount}</div>
          <div className="text-sm text-slate-600">Total Nodes</div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{actualDepth}</div>
          <div className="text-sm text-slate-600">Actual Depth</div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {theoreticalHeight !== null ? theoreticalHeight.toFixed(2) : 'N/A'}
          </div>
         
          <div className="text-sm text-slate-600">Balanced</div>
        </div>
      </div>
    </div>
  );
};

const AVLTreeVisualizer = () => {
  const [value, setValue] = useState('');
  const [tree, setTree] = useState(null);
  const [rotations, setRotations] = useState([]);
  const [highlight, setHighlight] = useState([]);
  const [theoreticalHeight, setTheoreticalHeight] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current tree state
  const fetchTree = async () => {
    try {
      const treeRes = await axios.get('http://localhost:5000/api/avl/tree');
      const heightRes = await axios.get('http://localhost:5000/api/avl/height');
      setTree(treeRes.data);
      setTheoreticalHeight(heightRes.data.height);
    } catch (error) {
      console.error('Error fetching tree:', error);
    }
  };

  // Load tree on component mount
  useEffect(() => {
    fetchTree();
  }, []);

  const insertNode = async () => {
    if (!value || loading) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/avl/insert', {
        value: parseInt(value),
      });
      setTree(res.data.root);
      setRotations(res.data.rotations || []);
      setHighlight(res.data.rotations?.map((r) => r.pivot) || []);
      setValue('');
      
      // Fetch updated height
      const heightRes = await axios.get('http://localhost:5000/api/avl/height');
      setTheoreticalHeight(heightRes.data.height);
      
      setTimeout(() => setHighlight([]), 3000);
    } catch (error) {
      console.error('Error inserting node:', error);
    }
    setLoading(false);
  };

  const deleteNode = async () => {
    if (!value || loading) return;
    setLoading(true);
    try {
      const res = await axios.delete(`http://localhost:5000/api/avl/delete/${value}`);
      setTree(res.data.root);
      setRotations(res.data.rotations || []);
      setHighlight(res.data.rotations?.map((r) => r.pivot) || []);
      setValue('');
      
      // Fetch updated height
      const heightRes = await axios.get('http://localhost:5000/api/avl/height');
      setTheoreticalHeight(heightRes.data.height);
      
      setTimeout(() => setHighlight([]), 3000);
    } catch (error) {
      console.error('Error deleting node:', error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      insertNode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AVL Tree Visualizer
          </h1>
          <p className="text-slate-600 text-lg">
            Self-balancing binary search tree with visual rotations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter value"
                className="px-4 py-3 border-2 border-slate-200 rounded-xl w-40 focus:border-blue-500 focus:outline-none transition-all duration-200 text-center font-semibold"
                disabled={loading}
              />
            </div>
            
            <button
              onClick={insertNode}
              disabled={loading || !value}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '⏳' : '➕'} Insert
            </button>
            
            <button
              onClick={deleteNode}
              disabled={loading || !value}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '⏳' : '🗑️'} Delete
            </button>

            <button
              onClick={fetchTree}
              className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 Refresh
            </button>
            <Link to="/application" className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-3 rounded-xl font-semibold">Application</Link>
            <Link to="/song" className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-6 py-3 rounded-xl font-semibold">Auto-Suggest Search Engine</Link>
            
          </div>
        </div>

        {/* Tree Statistics */}
        <div className="mb-8">
          <TreeStats tree={tree} theoreticalHeight={theoreticalHeight} />
        </div>

        {/* Rotations Display */}
        {rotations.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl shadow-lg border border-orange-200 mb-8">
            <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Recent Rotations
            </h3>
            <div className="grid gap-2">
              {rotations.map((r, i) => (
                <div key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span className="font-semibold text-orange-700">{r.type}</span>
                  <span className="text-slate-600 ml-2">rotation at node</span>
                  <span className="font-bold text-orange-800 ml-2">{r.pivot}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tree Visualization */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
          <div className="flex justify-center min-w-full">
            {tree ? (
              <div className="py-8">
                <Node node={tree} highlight={highlight} />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-slate-500">🌳</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-600 mb-2">Tree is Empty</h3>
                <p className="text-slate-500">Insert some values to see your AVL tree grow!</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mr-2"></div>
              <span>Normal Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mr-2"></div>
              <span>Recently Rotated</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Balance Factor</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-2 bg-slate-600 rounded-full mr-2"></div>
              <span>Depth Level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AVLTreeVisualizer;