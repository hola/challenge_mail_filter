// by: max.leizerovich@gmail.com
var asterix = '*'.charCodeAt(0);

var PatternTreeNode = (function () {
    function PatternTreeNode() {
        this.children = {};
        this.filters = [];
    }
    return PatternTreeNode;
})();

var Prospects = (function () {
    function Prospects(_initialSize) {
        if (_initialSize === void 0) { _initialSize = 5; }
        this._initialSize = _initialSize;
        this.currentItems = Array(_initialSize);
        this.currentItemsLength = 0;
        this._newItems = Array(_initialSize);
        this._newItemsLength = 0;
    }
    Prospects.prototype.flushNewItems = function () {
        var temp = this.currentItems;
        this.currentItems = this._newItems;
        this.currentItemsLength = this._newItemsLength;
        this._newItems = temp;
        this._newItemsLength = 0;
    };
    Prospects.prototype.addNewItem = function (node) {
        if (this._newItemsLength === this._initialSize) {
            this.currentItems = this.currentItems.concat(Array(this._initialSize));
            this._newItems = this._newItems.concat(Array(this._initialSize));
            this._initialSize *= 2;
        }
        this._newItems[this._newItemsLength] = node;
        this._newItemsLength++;
    };
    return Prospects;
})();

function addPatternToTree(filter, pattern, root) {
    if (!pattern || pattern.length === 1 && pattern.charCodeAt(0) === asterix) {
        root.filters.push(filter);
        return;
    }
    var length = pattern.length;
    var prevPatternLetter = ' ';
    for (var i = 0; i < length; i++) {
        var patternLetter = pattern.charAt(i);
        if (prevPatternLetter.charCodeAt(0) === asterix && patternLetter.charCodeAt(0) === asterix) {
            continue;
        }
        prevPatternLetter = patternLetter;
        if (!root.children[prevPatternLetter])
            root.children[prevPatternLetter] = new PatternTreeNode();
        root = root.children[prevPatternLetter];
        if (i === length - 1) {
            root.filters.push(filter);
        }
    }
}
function getPatterTreeRoots(filters) {
    var retVal = {
        from: new PatternTreeNode(),
        to: new PatternTreeNode()
    };
    var length = filters.length;
    for (var i = 0; i < length; i++) {
        var filter = filters[i];
        addPatternToTree(filter, filter.from, retVal.from);
        addPatternToTree(filter, filter.to, retVal.to);
    }
    return retVal;
}
function getMatchingFilters(str, root) {
    var retVal = root.filters.slice();
    var stringLength = str.length;
    var prospects = new Prospects(); //PatternTreeNode[] = [root];
    prospects.addNewItem(root);
    prospects.flushNewItems();
    for (var i = 0; i < stringLength; i++) {
        for (var j = prospects.currentItemsLength - 1; j >= 0; j--) {
            var node = prospects.currentItems[j];
            var astrixChild = node.children['*'];
            if (astrixChild) {
                prospects.addNewItem(node);
                prospects.addNewItem(astrixChild);
            }
            var questionMarkChild = node.children['?'];
            if (questionMarkChild)
                prospects.addNewItem(questionMarkChild);
            var letterChild = node.children[str.charAt(i)];
            if (letterChild)
                prospects.addNewItem(letterChild);
        }
        prospects.flushNewItems();
    }
    for (var j = prospects.currentItemsLength - 1; j >= 0; j--)
        retVal = retVal.concat(prospects.currentItems[j].filters);
    return retVal;
}

function filter(messages, rules) {
    var retVal = {};
    var treeRoots = getPatterTreeRoots(rules);
    var messageKeys = Object.keys(messages);
    var length = messageKeys.length;
    for (var i = 0; i < length; i++) {
        var key = messageKeys[i];
        var message = messages[key];
        var fromFilters = getMatchingFilters(message.from, treeRoots.from);
        var toFilters = getMatchingFilters(message.to, treeRoots.to);
        var fromIndex = {};
        for (var j = fromFilters.length - 1; j >= 0; j--)
            fromIndex[fromFilters[j].from] = true;
        var actions = [];
        for (var j = toFilters.length - 1; j >= 0; j--) {
            var toFilter = toFilters[j];
            if (fromIndex[toFilter.from])
                actions.push(toFilter.action);
        }
        retVal[key] = actions;
    }
    return retVal;
}
module.exports = filter;
