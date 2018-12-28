import $ from 'jquery';
import {parseCode} from './code-analyzer';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let funcToParse = $('#funcPlaceholder').val();
        let parsedCode = parseCode(codeToParse , funcToParse);

        let viz = new Viz({ Module, render });
        viz.renderString('digraph { ' +  parsedCode + ' }')
            .then(function(result) {
                document.getElementById('parsedCode').innerHTML = result;
            });
    });
});
