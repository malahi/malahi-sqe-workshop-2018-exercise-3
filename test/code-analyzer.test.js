import assert from 'assert';
import {makeParamString , parseCode , addTag , addIndex , getLastN , getStatement} from '../src/js/code-analyzer';
import * as esprima from 'esprima';


describe('1', () => {
    it('1', () => {
        assert.equal(
            makeParamString(esprima.parseScript('function f(x , y , z){}').body[0].params , '1 , 2 , 3'),
            'let x = 1; let y = 2; let z = 3;');
    });

    it('2', () => {
        assert.equal(
            parseCode( 'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n' , '1, 2, 3'),
            'n1 [label="-1-\n' +
            'let a = x + 1;" , fillcolor="green" , style=filled , shape="box"] n2 [label="-2-\n' +
            'let b = a + y;" , fillcolor="green" , style=filled , shape="box"] n3 [label="-3-\n' +
            'let c = 0;" , fillcolor="green" , style=filled , shape="box"] n4 [label="-4-\n' +
            'b < z" , fillcolor="green" , style=filled , shape=diamond] n5 [label="-5-\n' +
            'c = c + 5" , shape="box"] n6 [label="-6-\n' +
            'return c;" , fillcolor="green" , style=filled , shape="box"] n7 [label="-7-\n' +
            'b < z * 2" , fillcolor="green" , style=filled , shape=diamond] n8 [label="-8-\n' +
            'c = c + x + 5" , fillcolor="green" , style=filled , shape="box"] n9 [label="-9-\n' +
            'c = c + z + 5" , shape="box"] n1 -> n2 [] n2 -> n3 [] n3 -> n4 [] n4 -> n5 [label="true"] n4 -> n7 [label="false"] n5 -> n6 [] n7 -> n8 [label="true"] n7 -> n9 [label="false"] n8 -> n6 [] n9 -> n6 []');
    });

    it('3', () => {
        assert.equal(
            parseCode( 'let a = 2;\n' +
                'function f(x) {\n' +
                '\n' +
                '    if(a == 1) {\n' +
                '        return 1;\n' +
                '    }\n' +
                ' return 1;' +
                '}' , '1'),
            'n1 [label="-1-\n' +
            'a == 1" , fillcolor="green" , style=filled , shape=diamond] n2 [label="-2-\n' +
            'return 1;" , shape="box"] n3 [label="-3-\n' +
            'return 1;" , fillcolor="green" , style=filled , shape="box"] n1 -> n2 [label="true"] n1 -> n3 [label="false"]');
    });

    it('4', () => {
        assert.equal(
            parseCode('function f() {\n' +
                ' return 1;\n' +
                '}' , ''),
            'n1 [label="-1-\n' +
            'return 1;" , fillcolor="green" , style=filled , shape="box"]');
    });

    it('5', () => {
        assert.equal(
            addIndex(['n1' , 'label="let = 1;"]'] , '-1-'),
            'label="--1--\n' +
            'let = 1;"]');
    });

    it('6', () => {
        assert.equal(
            getStatement(['n1 [label="VariableDeclaration"]' , 'n2 [label="BinaryExpression"]' , 'n3 [label="ReturnStatement"]'] , 'n1'),
            'VariableDeclaration');
    });

    it('7', () => {
        assert.equal(
            getStatement(['n1 [label="VariableDeclaration"]' , 'n2 [label="BinaryExpression"]' , 'n3 [label="ReturnStatement"]'] , 'n3'),
            'ReturnStatement');
    });

    it('8', () => {
        assert.equal(
            addTag(['n1' , 'label="let = 1;"]'] , 'fillcolor=green'),
            'label="let = 1;" , fillcolor=green]');
    });

    it('9', () => {
        assert.equal(
            getLastN(['n1 []', 'n2 []' , 'n3 []' , 'n4 []' , 'n5 [label="exit"]']),
            'n5');
    });

    it('10', () => {
        assert.equal(
            getStatement(['n1 [label="VariableDeclaration"]' , 'n2 [label="BinaryExpression"]' , 'n3 [label="ReturnStatement"]'] , 'n2'),
            'BinaryExpression');
    });

});
