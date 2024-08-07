/**
 * html parse
 */

interface Attribute {
  [key: string]: string;
}

const META_TAGE_NAME = 'meta';
const LINK_TAGE_NAME = 'link';
const IMG_TAGE_NAME = 'img';
const BR_TAGE_NAME = 'br';
const SCRIPT_TAGE_NAME = 'script';

const SELF_TAGS = [META_TAGE_NAME, LINK_TAGE_NAME, IMG_TAGE_NAME, BR_TAGE_NAME];

let nodes: Node[] = [];
let nodeId = 1;

const isSelfTag = (tagStartStr: string) => {
  const [, tagName = ''] = /(\w*)\s*(.*)/.exec(tagStartStr) || [];
  return SELF_TAGS.includes(tagName.toLowerCase()) || tagStartStr.endsWith('/');
};

/**
 * 分离子节点
 * @param str
 */
const parseContentStr = (str: string): Node[] => {
  let children = [];
  const [, tagS = ''] = /<(.*?)>/.exec(str) || [];
  const [, tagName = ''] = /(\w*)\s*(.*)/.exec(tagS) || [];

  if (tagS.startsWith('/')) return [];

  // 自闭合标签
  let nodeStr = '';
  if (isSelfTag(tagS) || !RegExp(`</${tagName}>`).test(str)) {
    [nodeStr = ''] = str.match(RegExp(`<${tagName}.*?>`)) || [];
  } else {
    [nodeStr = ''] = str.match(RegExp(`<${tagName}.*?>([\\s\\S]*?)</${tagName}>`)) || [];
    const reg_tag = RegExp(`<${tagName}.*?>`, 'gim');
    let tagLength = nodeStr.match(reg_tag)?.length || 0;

    if (tagLength > 1) {
      const reg_tag_end = RegExp(`[\\s\\S]*?</${tagName}>`, 'gim');
      let _str = '';
      for (let i = 0; i < tagLength; i++) {
        const result = reg_tag_end.exec(str);
        if (!result) break;
        _str += result[0];
        tagLength = _str.match(RegExp(`<${tagName}.*?>`, 'gim'))?.length || 0;
      }
      nodeStr = _str;
    }
  }
  if (!nodeStr) return [];
  children.push(new Node(nodeStr));
  str = str.replace(nodeStr, '');
  if (str.includes('<')) {
    children.push(...parseContentStr(str));
  }
  return children;
};

const handleSel = (str: string) => {
  let arr = [];
  let _str = '';
  for (let item of str) {
    if (['.', '#'].includes(item)) {
      if (_str) arr.push(_str);
      _str = '';
    }
    _str += item;
  }
  if (_str) arr.push(_str);
  return arr;
};

const tagSelect = (tagName: string, nodes: Node[], all = true) => {
  let _nodes = [];
  for (let node of nodes) {
    if (node.tagName === tagName) {
      _nodes.push(node);
      if (!all) {
        break;
      }
    }
  }
  return _nodes;
};

const attrSelect = (selector: string, nodes: Node[], all = true) => {
  const str = selector.substring(1, selector.length - 1);
  const [attrName, attrValue] = str.split('=');
  let _nodes = [];
  for (let node of nodes) {
    if (Object.keys(node.attributes).includes(attrName)) {
      if (attrValue === undefined) {
        _nodes.push(node);
      } else if (node.attributes[attrName] === attrValue) {
        _nodes.push(node);
      }
      if (!all) {
        break;
      }
    }
  }
  return _nodes;
};

const classSelect = (selector: string, nodes: Node[], all = true) => {
  const className = selector.substring(1);
  let _nodes = [];
  for (let node of nodes) {
    if (node.classList.includes(className)) {
      _nodes.push(node);
      if (!all) {
        break;
      }
    }
  }
  return _nodes;
};

const idSelect = (selector: string, nodes: Node[]) => {
  const id = selector.substring(1);
  let _node: Node | null = null;
  for (let node of nodes) {
    if (node.attributes['id'] === id) {
      _node = node;
      break;
    }
  }
  return _node;
};

const getChildren = (nodes: Node[]) => {
  let arr: Node[] = [];
  for (let node of nodes) {
    arr.push(...node.children);
  }
  if (arr.length) {
    arr.push(...getChildren(arr));
  }
  return arr;
};

const handleAttrs = (attrsStr = ''): Attribute => {
  let attributes: Attribute = {};
  for (let str of attrsStr.match(/([\S]+?="[\s\S]+?")|([\S]+)/g) || []) {
    if (!str) continue;
    str = str.includes('=') ? str : str + '=';
    const { key, value = '' } = str.match(/(?<key>[\S]+?)=(?<value>[\s\S]+)?/)?.groups || {};
    attributes[key] = value.replace(/^('|")(.*)('|")$/, '$2');
  }
  return attributes;
};

const handleInnerText = (str: string) => {
  return str.replace(/(<.*?>)|(<\/.*?>)/g, '');
};

class Node {
  tagName: string;
  attributes: Attribute = {};
  innerText: string = '';
  innerHTML: string = '';
  outerHTML: string = '';
  classList: string[] = [];
  children: Node[] = [];
  _nodeId: number;

  get firstChild(): Node | null {
    if (!this.children.length) return null;
    return this.children[0];
  }

  get lastChild(): Node | null {
    if (!this.children.length) return null;
    return this.children[this.children.length - 1];
  }

  constructor(str: string) {
    const [, tagS = ''] = /<(.*?)\/?>/.exec(str) || [];
    const [, tagName, attrsStr = ''] = /(\w*)\s*(.*)/.exec(tagS) || [];
    this.tagName = tagName.toLowerCase();
    this.attributes = handleAttrs(attrsStr);
    this.classList = ((this.attributes['class'] || '').match(/[\S]*/g) || []).filter((v) => v);
    let outerHTML = '';
    let innerHTML = '';
    if (isSelfTag(/<(.*?)>/.exec(str)?.[1] || '') || !RegExp(`</${tagName}>`).test(str)) {
      outerHTML = str;
    } else {
      [outerHTML = '', innerHTML = ''] = str.match(RegExp(`<${tagName}.*?>([\\s\\S]*)</${tagName}>`)) || [];
    }
    this.outerHTML = outerHTML.replace(/^(\s)*(.*?)(\s)*$/, '$2');
    this.innerHTML = innerHTML.replace(/^(\s)*(.*?)(\s)*$/, '$2');
    this.innerText = handleInnerText(this.innerHTML);
    if (tagName.toLowerCase() !== SCRIPT_TAGE_NAME && this.innerHTML.includes('<')) {
      this.children = parseContentStr(this.innerHTML);
    }
    this._nodeId = nodeId++;
    nodes.push(this);
  }
  querySelector(selector: string): Node | null {
    return this.querySelectorAll(selector)[0] || null;
  }
  querySelectorAll(selector: string) {
    const selectors = selector.match(/[\S]*/g)?.filter((v) => v) || [];
    let _nodes = getChildren([this]);
    let result: Node[] = _nodes;
    let flag = true;
    for (let sel of selectors) {
      // 获取子级
      if (!flag) {
        result = getChildren(result);
      }
      flag = false;
      for (let _sel of handleSel(sel)) {
        // 同级筛选
        if (/^\[(.*)\]$/.test(_sel)) {
          result = attrSelect(_sel, result);
        } else if (/^\./.test(_sel)) {
          result = classSelect(_sel, result);
          result = result.filter((v) => v.classList.includes(_sel.slice(1)));
        } else if (/^\#/.test(_sel)) {
          const _node = idSelect(_sel, result);
          result = _node ? [_node] : [];
          result = result.filter((v) => v.attributes.id === _sel.slice(1));
        } else {
          result = tagSelect(_sel, result);
        }
      }
    }
    return result;
  }
  removeChild(node: Node | null) {
    if (!node) return;
    this.children = this.children.filter((v) => v !== node);
    let innerHTML = '';
    for (let child of this.children) {
      innerHTML += child.outerHTML;
    }
    this.outerHTML = this.outerHTML.replace(this.innerHTML, innerHTML);
    this.innerHTML = innerHTML;
    this.innerText = handleInnerText(this.innerHTML);
  }
}

export const htmlparse = (html: string) => {
  // const [outerHTML] = /<html.*?>\s*([\s\S]*)<\/html>/gim.exec(html.replace(/<!--[\s\S]*?-->/g, '')) || [];
  const outerHTML = html.replace(/<!DOCTYPE.*?>/i, '').replace(/<!--[\s\S]*?-->/g, '');
  return new Node(outerHTML);
};
