// backend/avl/AVLTree.js

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
    this.lastRotations = [];
    this.nodeCount = 0;
  }

  getHeight(node) {
    if (!node) return 0;
    return node.height;
  }

  getBalanceFactor(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  updateHeight(node) {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    this.updateHeight(y);
    this.updateHeight(x);

    this.lastRotations.push({ type: 'RR', pivot: y.value });
    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    this.updateHeight(x);
    this.updateHeight(y);

    this.lastRotations.push({ type: 'LL', pivot: x.value });
    return y;
  }

  rotateLeftRight(node) {
    node.left = this.rotateLeft(node.left);
    return this.rotateRight(node);
  }

  rotateRightLeft(node) {
    node.right = this.rotateRight(node.right);
    return this.rotateLeft(node);
  }

  _insert(node, value) {
    if (!node) {
      this.nodeCount++;
      return new Node(value);
    }

    if (value < node.value) {
      node.left = this._insert(node.left, value);
    } else if (value > node.value) {
      node.right = this._insert(node.right, value);
    } else {
      return node; // duplicate values not allowed
    }

    this.updateHeight(node);

    const balance = this.getBalanceFactor(node);

    if (balance > 1 && value < node.left.value) return this.rotateRight(node);
    if (balance < -1 && value > node.right.value) return this.rotateLeft(node);
    if (balance > 1 && value > node.left.value) return this.rotateLeftRight(node);
    if (balance < -1 && value < node.right.value) return this.rotateRightLeft(node);

    return node;
  }

  _minValueNode(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  _delete(node, value) {
    if (!node) return node;

    if (value < node.value) {
      node.left = this._delete(node.left, value);
    } else if (value > node.value) {
      node.right = this._delete(node.right, value);
    } else {
      if (!node.left || !node.right) {
        const temp = node.left || node.right;
        this.nodeCount--;
        return temp;
      }
      const temp = this._minValueNode(node.right);
      node.value = temp.value;
      node.right = this._delete(node.right, temp.value);
    }

    this.updateHeight(node);
    const balance = this.getBalanceFactor(node);

    if (balance > 1 && this.getBalanceFactor(node.left) >= 0) return this.rotateRight(node);
    if (balance > 1 && this.getBalanceFactor(node.left) < 0) return this.rotateLeftRight(node);
    if (balance < -1 && this.getBalanceFactor(node.right) <= 0) return this.rotateLeft(node);
    if (balance < -1 && this.getBalanceFactor(node.right) > 0) return this.rotateRightLeft(node);

    return node;
  }

  insert(value) {
    this.lastRotations = [];
    this.root = this._insert(this.root, value);
    return { root: this.root, rotations: this.lastRotations };
  }

  delete(value) {
    this.lastRotations = [];
    this.root = this._delete(this.root, value);
    return { root: this.root, rotations: this.lastRotations };
  }

  getTree() {
    return { root: this.root, rotations: this.lastRotations };
  }

  getHeightLogN() {
    return Math.ceil(Math.log2(this.nodeCount + 1));
  }
}

module.exports = AVLTree;
