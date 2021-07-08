
// Stack overflow time. Obj must be serialised to save it
const convertFromRange = (range) => {
    var sC = range.startContainer, eC = range.endContainer;
    var A = [];
    const endOfDOM = document.querySelector('body')
    while (sC !== endOfDOM && sC) {
        A.push(getNodeIndex(sC));
        sC = sC.parentNode;
    }
    var B = [];
    while (eC && eC !== endOfDOM) {
        B.push(getNodeIndex(eC));
        eC = eC.parentNode;
    }
    if (B.length == 0) {
        B = A;
        eC = sC;
    }
    const rangePosition = { "sC": A, "sO": range.startOffset, "eC": B, "eO": range.endOffset };
    return rangePosition
}
// Stack overflow time. Obj must be serialised to save it
convertToRange = (serial) => {

    const editor = document.querySelector('body')
    var caretPosition = serial;
    var sel = window.getSelection();
    var range = document.createRange();
    var x, C, sC = editor, eC = editor;

    if (caretPosition.sC) {
        C = caretPosition.sC;
        x = C.length;
        while (x--) {
            var t = C[x];
            if (sC) {
                var a = sC.childNodes[t];
                if (a == undefined) {
                    caretPosition.sO = 0;
                    break;
                }
                sC = a;

            }
        }
    }


    if (caretPosition.eC) {
        C = caretPosition.eC;
        x = C.length;

        while (x--) {
            if (!eC) break;
            var a = eC.childNodes[C[x]];
            if (a == undefined) {
                caretPosition.eO = 0;
                break;
            }
            eC = a;

        }
    }

    if (sC) {
        range.setStart(sC, caretPosition.sO);
    }


    if (eC) {
        var endPos = caretPosition.eO;
        if (eC.nodeValue && endPos > eC.nodeValue.length) {
            endPos = eC.length;
        }

        // try {
        range.setEnd(eC, endPos);
        // }
        // catch (e) {
        // 	console.log('caret restore not allowed');
        // }
    }
    sel.removeAllRanges();
    sel.addRange(range);
    return range
}