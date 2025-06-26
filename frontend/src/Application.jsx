import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Database, Search, Clock, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

const AVLComplexityAnalyzer = () => {
  const [nodeCount, setNodeCount] = useState(1000);
  const [searchValue, setSearchValue] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('small');
  const [isSearching, setIsSearching] = useState(false);

  // Predefined datasets for demonstration
  const datasets = {
    small: { nodes: 1000, name: 'Small Database (1K records)' },
    medium: { nodes: 100000, name: 'Medium Database (100K records)' },
    large: { nodes: 1000000, name: 'Large Database (1M records)' },
    enterprise: { nodes: 10000000, name: 'Enterprise Database (10M records)' }
  };

  // Calculate time complexities
  const calculateComplexities = (n) => {
    return {
      avlSearch: Math.log2(n),
      avlInsert: Math.log2(n),
      avlDelete: Math.log2(n),
      unbalancedBinaryTree: n / 2, // worst case for unbalanced tree (becomes like linked list)
      linearSearch: n,
      hashSearch: 1 // average case
    };
  };

  // Generate comparison data for charts
  const generateComparisonData = () => {
    const sizes = [100, 1000, 10000, 100000, 1000000, 10000000];
    return sizes.map(size => ({
      size: size >= 1000000 ? `${size/1000000}M` : size >= 1000 ? `${size/1000}K` : size,
      actualSize: size,
      'AVL Tree (Balanced)': Math.log2(size),
      'Binary Tree (Unbalanced)': size / 2000, // Scaled down worst case - becomes linear
      'Linear Search': size / 1000, // Scaled down for visibility
      'Hash Table (avg)': 1
    }));
  };

  // Generate performance metrics for current dataset
  const getCurrentMetrics = () => {
    const n = datasets[selectedDataset].nodes;
    const complexities = calculateComplexities(n);
    
    return {
      searchTime: complexities.avlSearch,
      insertTime: complexities.avlInsert,
      deleteTime: complexities.avlDelete,
      memoryEfficiency: 85, // AVL trees have good memory efficiency
      balanceFactor: 'Always ≤ 1',
      height: Math.ceil(Math.log2(n + 1))
    };
  };

  // Simulate search operation
  const simulateSearch = async () => {
    if (!searchValue) return;
    
    setIsSearching(true);
    const metrics = getCurrentMetrics();
    
    // Simulate search delay based on complexity
    const delay = Math.max(100, metrics.searchTime * 50);
    
    setTimeout(() => {
      setIsSearching(false);
    }, delay);
  };

  const comparisonData = generateComparisonData();
  const currentMetrics = getCurrentMetrics();

  // Database indexing benefits
  const indexingBenefits = [
    {
      feature: 'Range Queries',
      description: 'Efficiently find all records between two values',
      complexity: 'O(log n + k)',
      icon: <Search className="w-5 h-5" />
    },
    {
      feature: 'Sorted Retrieval',
      description: 'In-order traversal gives sorted results',
      complexity: 'O(n)',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      feature: 'Auto-Balancing',
      description: 'Maintains optimal height automatically',
      complexity: 'O(log n)',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      feature: 'Memory Efficient',
      description: 'Only stores necessary pointers and balance factors',
      complexity: 'O(n)',
      icon: <Database className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AVL Tree Complexity Analyzer
          </h1>
          <p className="text-slate-600 text-lg">
            Understanding Time Complexity and Database Indexing Applications
          </p>
        </div>

        {/* Dataset Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Database Size Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(datasets).map(([key, dataset]) => (
              <button
                key={key}
                onClick={() => setSelectedDataset(key)}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 shadow-lg ${
                  selectedDataset === key
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                <div className="text-lg font-semibold">{dataset.name}</div>
                <div className="text-sm opacity-70">{dataset.nodes.toLocaleString()} records</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-slate-800">Search Performance</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {currentMetrics.searchTime.toFixed(2)} steps
            </div>
            <div className="text-slate-600">
              O(log n) complexity for {datasets[selectedDataset].nodes.toLocaleString()} records
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-slate-800">Tree Height</h3>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {currentMetrics.height}
            </div>
            <div className="text-slate-600">
              Maximum height for balanced tree
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-slate-800">Balance Factor</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ≤ 1
            </div>
            <div className="text-slate-600">
              Always maintained automatically
            </div>
          </div>
        </div>

       

        {/* Time Complexity Comparison Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Time Complexity Comparison
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="size" 
                stroke="#64748B"
                tick={{ fill: '#64748B' }}
              />
              <YAxis 
                stroke="#64748B"
                tick={{ fill: '#64748B' }}
                label={{ value: 'Operations (scaled)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748B' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  color: '#1E293B',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="AVL Tree (Balanced)" stroke="#3B82F6" strokeWidth={4} dot={{ fill: '#3B82F6', strokeWidth: 0, r: 5 }} />
              <Line type="monotone" dataKey="Binary Tree (Unbalanced)" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 0, r: 4 }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="Hash Table (avg)" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 3 }} />
              <Line type="monotone" dataKey="Linear Search" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', strokeWidth: 0, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AVL vs Binary Tree Comparison */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Why AVL Trees Are Superior
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                AVL Tree (Self-Balancing)
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li>• <strong>Search:</strong> Always O(log n)</li>
                <li>• <strong>Insert:</strong> Always O(log n)</li>
                <li>• <strong>Delete:</strong> Always O(log n)</li>
                <li>• <strong>Height:</strong> Always ≤ 1.44 × log₂(n)</li>
                <li>• <strong>Balance Factor:</strong> Always ≤ 1</li>
              </ul>
            </div>
            
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Unbalanced Binary Tree
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li>• <strong>Search:</strong> O(n) in worst case</li>
                <li>• <strong>Insert:</strong> O(n) in worst case</li>
                <li>• <strong>Delete:</strong> O(n) in worst case</li>
                <li>• <strong>Height:</strong> Can become n (like linked list)</li>
                <li>• <strong>Balance:</strong> No automatic balancing</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Database Performance Impact:</h4>
            <p className="text-slate-700">
              In a database with 1 million records, an AVL tree guarantees finding any record in ~20 steps, 
              while an unbalanced binary tree might require up to 500,000 steps in the worst case!
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            Database Indexing Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indexingBenefits.map((benefit, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-indigo-600">{benefit.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-800">{benefit.feature}</h3>
                </div>
                <p className="text-slate-600 mb-3">{benefit.description}</p>
                <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-mono">
                  {benefit.complexity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-world Applications */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-indigo-100">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            Real-world Database Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">MySQL B+ Trees</div>
              <p className="text-slate-600">Similar balanced tree structure for InnoDB storage engine</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">PostgreSQL</div>
              <p className="text-slate-600">Uses B-tree variants for primary and secondary indexes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">MongoDB</div>
              <p className="text-slate-600">B-tree indexes for efficient query performance</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-slate-700">
              <strong className="text-yellow-700">Why AVL Trees?</strong> While databases often use B+ trees for disk storage optimization, 
              AVL trees demonstrate the same logarithmic time complexity principles that make indexed database 
              operations fast and efficient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AVLComplexityAnalyzer;