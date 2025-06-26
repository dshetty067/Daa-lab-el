import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, RefreshCw, Info, Eye, EyeOff } from 'lucide-react';

// AVL Tree Node for storing words
class WordNode {
  constructor(word) {
    this.word = word.toLowerCase();
    this.displayWord = word;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.balanceFactor = 0;
  }
}

// AVL Tree implementation for auto-suggest
class AVLSearchTree {
  constructor() {
    this.root = null;
    this.rotationHistory = [];
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
      node.balanceFactor = this.getBalance(node);
    }
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    
    x.right = y;
    y.left = T2;
    
    this.updateHeight(y);
    this.updateHeight(x);
    
    this.rotationHistory.push({
      type: 'Right Rotation',
      pivot: y.word,
      newRoot: x.word
    });
    
    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    
    y.left = x;
    x.right = T2;
    
    this.updateHeight(x);
    this.updateHeight(y);
    
    this.rotationHistory.push({
      type: 'Left Rotation',
      pivot: x.word,
      newRoot: y.word
    });
    
    return y;
  }

  insert(node, word) {
    if (!node) {
      return new WordNode(word);
    }

    const normalizedWord = word.toLowerCase();
    const comparison = normalizedWord.localeCompare(node.word);

    if (comparison < 0) {
      node.left = this.insert(node.left, word);
    } else if (comparison > 0) {
      node.right = this.insert(node.right, word);
    } else {
      return node; // Duplicate words not allowed
    }

    this.updateHeight(node);
    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && normalizedWord.localeCompare(node.left.word) < 0) {
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && normalizedWord.localeCompare(node.right.word) > 0) {
      return this.rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && normalizedWord.localeCompare(node.left.word) > 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && normalizedWord.localeCompare(node.right.word) < 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  findMin(node) {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  delete(node, word) {
    if (!node) return node;

    const normalizedWord = word.toLowerCase();
    const comparison = normalizedWord.localeCompare(node.word);

    if (comparison < 0) {
      node.left = this.delete(node.left, word);
    } else if (comparison > 0) {
      node.right = this.delete(node.right, word);
    } else {
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right;
        if (!temp) {
          node = null;
        } else {
          Object.assign(node, temp);
        }
      } else {
        const temp = this.findMin(node.right);
        node.word = temp.word;
        node.displayWord = temp.displayWord;
        node.right = this.delete(node.right, temp.word);
      }
    }

    if (!node) return node;

    this.updateHeight(node);
    const balance = this.getBalance(node);

    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rotateRight(node);
    }

    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.rotateLeft(node);
    }

    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  addWord(word) {
    if (word.trim()) {
      this.rotationHistory = [];
      this.root = this.insert(this.root, word.trim());
      return this.rotationHistory;
    }
    return [];
  }

  removeWord(word) {
    if (word.trim()) {
      this.rotationHistory = [];
      this.root = this.delete(this.root, word.trim());
      return this.rotationHistory;
    }
    return [];
  }

  searchSuggestions(prefix, maxResults = 10) {
    const suggestions = [];
    const normalizedPrefix = prefix.toLowerCase();
    
    const traverse = (node) => {
      if (!node || suggestions.length >= maxResults) return;
      
      // Check if current node matches prefix
      if (node.word.startsWith(normalizedPrefix)) {
        suggestions.push({
          word: node.displayWord,
          node: node
        });
      }
      
      // Decide which subtrees to explore
      const comparison = normalizedPrefix.localeCompare(node.word);
      
      if (comparison <= 0) {
        traverse(node.left);
      }
      if (comparison >= 0 || node.word.startsWith(normalizedPrefix)) {
        traverse(node.right);
      }
    };

    traverse(this.root);
    return suggestions.sort((a, b) => a.word.localeCompare(b.word));
  }

  getAllWords() {
    const words = [];
    const inOrder = (node) => {
      if (node) {
        inOrder(node.left);
        words.push(node.displayWord);
        inOrder(node.right);
      }
    };
    inOrder(this.root);
    return words;
  }

  getStats() {
    const countNodes = (node) => node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
    const getDepth = (node) => node ? 1 + Math.max(getDepth(node.left), getDepth(node.right)) : 0;
    
    return {
      totalWords: countNodes(this.root),
      treeDepth: getDepth(this.root) - 1
    };
  }
}

// AVL Tree Visualization Component
const AVLTreeNode = ({ node, highlightedWords = [], searchPrefix = '', depth = 0, position = 'root' }) => {
  if (!node) return null;
  
  const isHighlighted = highlightedWords.some(hw => hw.toLowerCase() === node.word.toLowerCase());
  const matchesSearch = searchPrefix && node.word.startsWith(searchPrefix.toLowerCase());

  return (
    <div className="flex flex-col items-center relative">
      {position !== 'root' && (
        <div className="absolute -top-6 w-px h-6 bg-slate-400" style={{ left: '50%', transform: 'translateX(-50%)' }} />
      )}
      
      <div className="relative">
        <div className={`
          min-w-20 px-3 py-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold text-white
          transition-all duration-300 transform hover:scale-105 shadow-lg border-2
          ${isHighlighted 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse border-yellow-300' 
            : matchesSearch
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-300'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-300'
          }
        `}>
          <div className="text-xs font-normal opacity-75">#{depth}</div>
          <div className="font-bold text-center leading-tight">{node.displayWord}</div>
        </div>
        
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <span className={`text-xs px-1 py-0.5 rounded font-bold
            ${Math.abs(node.balanceFactor) > 1 
              ? 'bg-red-500 text-white animate-bounce' 
              : 'bg-slate-600 text-white'
            }
          `}>
            BF:{node.balanceFactor}
          </span>
        </div>
      </div>

      {(node.left || node.right) && (
        <div className="flex justify-center mt-8 relative" style={{ minWidth: '200px' }}>
          {node.left && node.right && (
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-400" />
          )}
          
          <div className="flex justify-between w-full">
            <div className="flex-1 flex justify-center">
              {node.left && (
                <>
                  {node.right && <div className="absolute left-1/4 top-0 w-px h-4 bg-slate-400" />}
                  <AVLTreeNode 
                    node={node.left} 
                    highlightedWords={highlightedWords} 
                    searchPrefix={searchPrefix}
                    depth={depth + 1} 
                    position="left"
                  />
                </>
              )}
            </div>
            
            <div className="flex-1 flex justify-center">
              {node.right && (
                <>
                  {node.left && <div className="absolute right-1/4 top-0 w-px h-4 bg-slate-400" />}
                  <AVLTreeNode 
                    node={node.right} 
                    highlightedWords={highlightedWords} 
                    searchPrefix={searchPrefix}
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

const AutoSuggestSearch = () => {
  const [searchTree] = useState(() => new AVLSearchTree());
  const [searchTerm, setSearchTerm] = useState('');
  const [newWord, setNewWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [recentRotations, setRecentRotations] = useState([]);
  const [showTree, setShowTree] = useState(true);
  const [stats, setStats] = useState({ totalWords: 0, treeDepth: 0 });

  // Sample data
  const sampleWords = [
    'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew',
    'India', 'Japan', 'Kenya', 'London', 'Mumbai', 'Norway', 'Orlando', 'Paris',
    'Quebec', 'Russia', 'Spain', 'Turkey', 'Ukraine', 'Vietnam', 'Wales', 'Xavier',
    'Amazon', 'Boeing', 'Cisco', 'Dell', 'eBay', 'Facebook', 'Google', 'HP',
    'JavaScript', 'Python', 'React', 'Angular', 'Vue', 'Node', 'Express', 'MongoDB'
  ];

  useEffect(() => {
    // Initialize with sample data
    sampleWords.forEach(word => searchTree.addWord(word));
    updateStats();
  }, []);

  const updateStats = () => {
    setStats(searchTree.getStats());
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (value.trim()) {
      const results = searchTree.searchSuggestions(value, 8);
      setSuggestions(results);
      setHighlightedWords(results.map(r => r.word));
    } else {
      setSuggestions([]);
      setHighlightedWords([]);
    }
  };

  const handleAddWord = () => {
    if (newWord.trim()) {
      const rotations = searchTree.addWord(newWord);
      setRecentRotations(rotations);
      setNewWord('');
      updateStats();
      
      // Highlight the newly added word
      setHighlightedWords([newWord]);
      setTimeout(() => setHighlightedWords([]), 3000);
    }
  };

  const handleRemoveWord = (word) => {
    const rotations = searchTree.removeWord(word);
    setRecentRotations(rotations);
    updateStats();
    
    // Clear search if removed word was being searched
    if (searchTerm && word.toLowerCase().includes(searchTerm.toLowerCase())) {
      setSearchTerm('');
      setSuggestions([]);
    }
    setHighlightedWords([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.word);
    setSuggestions([]);
    setHighlightedWords([suggestion.word]);
    setTimeout(() => setHighlightedWords([]), 2000);
  };

  const handleReset = () => {
    searchTree.root = null;
    sampleWords.forEach(word => searchTree.addWord(word));
    setSearchTerm('');
    setNewWord('');
    setSuggestions([]);
    setHighlightedWords([]);
    setRecentRotations([]);
    updateStats();
  };

  const allWords = useMemo(() => searchTree.getAllWords(), [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Auto-Suggest Search Engine
          </h1>
          <p className="text-slate-600 text-lg">
            Real-time search suggestions powered by AVL Tree
          </p>
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200 mb-8">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">How Auto-Suggest Works</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Words are stored in an AVL tree in lexicographical order. When you type, the system performs 
                an efficient O(log n) search to find all words starting with your prefix. The balanced tree 
                structure ensures consistent fast performance even with thousands of words.
              </p>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Search Box */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-500" />
              Search Interface
            </h3>
            
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Start typing to see suggestions..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-lg"
              />
              
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">
                          {suggestion.word}
                        </span>
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {searchTerm && suggestions.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  No suggestions found for "{searchTerm}"
                </p>
              </div>
            )}
          </div>

          {/* Word Management */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-500" />
              Manage Words
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                  placeholder="Add new word..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddWord}
                  disabled={!newWord.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowTree(!showTree)}
                  className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {showTree ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showTree ? 'Hide' : 'Show'} Tree
                </button>
                
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-1 inline" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Search Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.totalWords}</div>
              <div className="text-sm text-slate-600">Total Words</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.treeDepth}</div>
              <div className="text-sm text-slate-600">Tree Depth</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{suggestions.length}</div>
              <div className="text-sm text-slate-600">Current Suggestions</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">O(log n)</div>
              <div className="text-sm text-slate-600">Search Complexity</div>
            </div>
          </div>
        </div>

        {/* Recent Rotations */}
        {recentRotations.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-yellow-200 mb-8">
            <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Recent Tree Rotations
            </h3>
            <div className="grid gap-2">
              {recentRotations.map((rotation, i) => (
                <div key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span className="font-semibold text-orange-700">{rotation.type}</span>
                  <span className="text-slate-600 ml-2">at "{rotation.pivot}" → new root: "{rotation.newRoot}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Word List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">All Words ({allWords.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {allWords.map((word, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group">
                  <span className={`font-medium ${
                    highlightedWords.includes(word) ? 'text-blue-600 font-bold' : 'text-slate-700'
                  }`}>
                    {word}
                  </span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200"
                    title="Remove word"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Legend & Instructions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Node Colors:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded mr-2"></div>
                    <span>Normal Word</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded mr-2"></div>
                    <span>Matches Search</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded mr-2"></div>
                    <span>Recently Added/Modified</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Try These:</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>• Type "A" to see all words starting with A</div>
                  <div>• Add "Apple123" and watch tree rebalance</div>
                  <div>• Remove words to see rotations</div>
                  <div>• Search for partial matches like "Goo"</div>
                </div>
              </div>
            </div>
          </div>
        </div>

     {/* AVL Tree Visualization */}
{showTree && (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
    <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
      AVL Tree Structure (Lexicographically Sorted)
    </h3>

    <div className="w-full overflow-x-auto">
      <div className="min-w-max flex justify-center">
        {searchTree.root ? (
          <div className="py-8">
            <AVLTreeNode 
              node={searchTree.root} 
              highlightedWords={highlightedWords}
              searchPrefix={searchTerm}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="text-xl font-semibold text-slate-600 mb-2">No Words in Dictionary</h4>
            <p className="text-slate-500">Add some words to see the AVL tree structure!</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default AutoSuggestSearch;