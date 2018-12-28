import * as esprima from 'esprima';
import * as esgraph from 'esgraph';
import * as escodegen from 'escodegen';
// let esprima = require('esprima');
// let esgraph = require('esgraph');
// let escodegen = require('escodegen');

let nodes = [[]];
let nodes_types = [[]];
let arrows = [[]];

let ans = [];
let env = '';

const makeParamString = (agrs , params) => {
    if(params === '')
        return '';
    params = esprima.parseScript(params).body[0].expression;
    params = params.type === 'SequenceExpression'? params.expressions.map((x) => escodegen.generate(x)) : [escodegen.generate(params)];
    return agrs.map((x , i) => 'let ' + x.name + ' = ' + params[i] + ';').join(' ');
};

const getLastN = (dot) => {
    return dot.filter((x)=> x.includes('label="exit"'))[0].split(' ')[0];
};

const findArrow = (n) => {
    let next = arrows[0].filter((x) => x[0] === n)[0];
    return next;
};

const findFalseArrow = (n) => {
    let next = arrows[0].filter((x) => x[0] === n);
    return next[1];
};

const getStatement = (nodes , node) => {
    let data = nodes.filter((x) => x.includes(node + ' ['))[0].split(' [')[1];
    return data.slice(7 , data.length - 2);
};

const isCondition = (n1) => {
    return funcParsersRV[getStatement(nodes_types[0] , n1)] !== undefined;
};

const getData = (node) => {
    let data = nodes[0].filter((x) => x[0] === node)[0].slice(1).join(' [');
    let str = data.slice(7 , data.length - 2);
    return str.charAt(str.length - 1) === ';' ? str : str + ';' ;
};

const makeArray = (codeToParse , json_func) => {
    let cfg = esgraph(json_func.body);
    nodes[0] = esgraph.dot(cfg, {counter: 0, source: codeToParse}).split('\n');
    nodes_types[0] = esgraph.dot(cfg).split('\n');

    nodes_types[0] = nodes_types[0].filter((x) => !x.includes('n0') && !x.includes('n' + getLastN(nodes_types[0])) && !x.includes('exception'));
    nodes[0] = nodes[0].filter((x) => !x.includes('n0') && !x.includes(getLastN(nodes[0])) && !x.includes('exception'));

    nodes_types[0] = nodes_types[0].filter((x) => !x.includes('->'));
    arrows[0] = nodes[0].filter((x) => x.includes('->'));

    arrows[0] = arrows[0].map((x) => x.split(' '));
    nodes[0] = nodes[0].filter((x) => !x.includes('->'));
    nodes[0] = nodes[0].map((x) => x.split(' ['));

};

const addToEnv = (n1) => {
    env += ' ' + getData(n1);
};

const addTag = (node , tag ) => {
    node = node.slice(1).join(' [');
    return node.slice(0 , node.length - 1) + ' , ' + tag + ']';
};

const addIndex = (node , i ) => {
    node = node.slice(1).join(' [');
    return node.slice(0 , 7) + '-' + i + '-' + '\n' + node.slice(7 , node.length);
};

const appendGlobaltoEnv = (global_vars , func_index) => {
    global_vars.map((x , i) => {i < func_index? env += escodegen.generate(x) : true;});
};

const parseCode = (codeToParse , apply) => {
    nodes = [[]]; nodes_types = [[]]; arrows = [[]]; ans = []; env = '';
    let obj = esprima.parse(codeToParse , {range: true});
    let func_index = obj.body.map((x , i) => x.type === 'FunctionDeclaration'? i: -1 ).filter((x) => x !== -1)[0];
    appendGlobaltoEnv(obj.body , func_index);
    env += makeParamString(obj.body[func_index].params , apply + '');
    makeArray(codeToParse , obj.body[func_index]);

    ans.push(nodes[0][0][0]);
    if(arrows[0].length !== 0)
        nextNode(arrows[0][0]);

    nodes[0] = nodes[0].map((x ) => { return ans.includes(x[0])? [x[0] , addTag(x , 'fillcolor="green" , style=filled')] : x; }).slice(0 , nodes[0].length - 1);
    nodes[0] = nodes[0].map((x , i) => { return [x[0] , addIndex(x , i+1)]; });
    nodes = nodes[0].map((x) => { return isCondition(x[0])? [x[0] , '[' + addTag(x , 'shape=diamond')].join(' ') : [x[0] , '[' + addTag(x , 'shape="box"')].join(' '); });
    arrows = arrows[0].map((x) => x.join(' '));
    let res = nodes.concat(arrows).join(' ');
    return res;
};

const nextNode = (n1) => {
    let next;
    addToEnv(n1[0]);
    if(!eval(env) && isCondition(n1[0])) {
        ans.push(n1[0]);
        let f_next = findFalseArrow(n1[0]);
        next = findArrow(f_next[2]);
        if(next === undefined) {
            ans.push(f_next[2]);
            return; }
    }else{
        next = findArrow(n1[2]);
        ans.push(n1[0]);
        if(next === undefined) {
            ans.push(n1[2]);
            return; }
    }
    nextNode (next);
};

const funcParsersRV = {
    'Literal': true,
    'Identifier': true,
    'BinaryExpression': true,
    'MemberExpression': true,
    'UnaryExpression': true,
    'ArrayExpression': true,
    'LogicalExpression': true
};

// module.exports = {parseCode , makeParamString , addTag , addIndex , getLastN , getStatement};
export {parseCode , makeParamString , addTag , addIndex , getLastN , getStatement};
