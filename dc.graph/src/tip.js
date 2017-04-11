/**
 * Asynchronous [d3.tip](https://github.com/Caged/d3-tip) support for dc.graph.js
 *
 * Add tooltips to the nodes and edges of a graph using an asynchronous callback to get
 * the html to show.
 *
 * Optional - requires separately loading the d3.tip script and CSS (which are included in
 * dc.graph.js in `web/js/d3-tip/index.js` and `web/css/d3-tip/example-styles.css`)
 *
 * @class tip
 * @memberof dc_graph
 * @return {Object}
 **/
dc_graph.tip = function() {
    var _tip = {}, _d3tip = null;
    var _timeout;

    /**
     * Assigns this tip object to a diagram. It will show tips for nodes in that diagram.
     * Usually you will not call this function directly. Instead, attach the tip object
     * using `diagram.child('tip', dc_graph.tip())`
     * @name parent
     * @memberof dc_graph.tip
     * @instance
     * @param {dc_graph.diagram} [parent]
     * @return {dc_graph.diagram}
     **/
    _tip.parent = property(null)
        .react(function(p) {
            if(p)
                p.on('drawn.tip', function(node, edge, ehover) {
                    annotate(node, ehover);
                });
            else if(_tip.parent())
                _tip.parent().on('drawn.tip', null);
        });

    function fetch_and_show_content(fetcher) {
         return function(d) {
             var target = d3.event.target,
                 next = function() {
                     _tip[fetcher]()(d, function(content) {
                         _d3tip.show(content, target);
                     });
                 };

             if(_tip.delay()) {
                 clearTimeout(_timeout);
                 _timeout = setTimeout(next, _tip.delay());
             }
             else next();
         };
    }

    function hide_tip() {
        if(_timeout) {
            clearTimeout(_timeout);
            _timeout = null;
        }
        _d3tip.hide();
    }

    function annotate(node, ehover) {
        if(!_d3tip) {
            _d3tip = d3.tip()
                .attr('class', 'd3-tip')
                .html(function(d) { return "<span>" + d + "</span>"; })
                .direction(_tip.direction());
            _tip.parent().svg().call(_d3tip);
        }
        node
            .on('mouseover.tip', fetch_and_show_content('content'))
            .on('mouseout.tip', hide_tip);
        ehover
            .on('mouseover.tip', fetch_and_show_content('content'))
            .on('mouseout.tip', hide_tip);
    }

    /**
     * Specify the direction for tooltips. Currently supports the
     * [cardinal and intercardinaldirections](https://en.wikipedia.org/wiki/Points_of_the_compass) supported by
     * [d3.tip.direction](https://github.com/Caged/d3-tip/blob/master/docs/positioning-tooltips.md#tipdirection):
     * `'n'`, `'ne'`, `'e'`, etc.
     * @name direction
     * @memberof dc_graph.tip
     * @instance
     * @param {String} [direction='n']
     * @return {String}
     * @return {dc_graph.tip}
     * @example
     * // show all the attributes and values in the node and edge objects
     * var tip = dc_graph.tip();
     * tip.content(tip.table());
     **/
    _tip.direction = property('n');

    /**
     * Specifies the function to generate content for the tooltip. This function has the
     * signature `function(d, k)`, where `d` is the datum of the node being hovered over,
     * and `k` is a continuation. The function should fetch the content, asynchronously if
     * needed, and then pass html forward to `k`.
     * @name content
     * @memberof dc_graph.tip
     * @instance
     * @param {Function} [content]
     * @return {Function}
     * @example
     * // Default behavior: show title
     * var tip = dc_graph.tip().content(function(d, k) {
     *     k(_tip.parent() ? _tip.parent().nodeTitle.eval(d) : '');
     * });
     **/
    _tip.content = property(function(d, k) {
        k(_tip.parent() ? _tip.parent().nodeTitle.eval(d) : '');
    });

    _tip.delay = property(0);

    return _tip;
};

/**
 * Generates a handler which can be passed to `tip.content` to produce a table of the
 * attributes and values of the hovered object.
 *
 * Note: this interface is not great and is subject to change in the near term.
 * @name table
 * @memberof dc_graph.tip
 * @instance
 * @return {Function}
 * @example
 * // show all the attributes and values in the node and edge objects
 * var tip = dc_graph.tip();
 * tip.content(tip.table());
 **/
dc_graph.tip.table = function() {
    var gen = function(d, k) {
        d = d.orig.value;
        var keys = Object.keys(d).filter(d3.functor(gen.filter()))
                .filter(function(k) {
                    return d[k];
                });
        var table = d3.select(document.createElement('table'));
        var rows = table.selectAll('tr').data(keys);
        var rowsEnter = rows.enter().append('tr');
        rowsEnter.append('td').text(function(k) { return k; });
        rowsEnter.append('td').text(function(k) { return d[k]; });
        k(table.node().outerHTML); // optimizing for clarity over speed (?)
    };
    gen.filter = property(true);
    return gen;
};
