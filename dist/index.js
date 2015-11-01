'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = function (React, TestUtils) {

  var render = function render(Comp) {
    return function (props) {
      var renderer = TestUtils.createRenderer();
      renderer.render(React.createElement(Comp, props));
      return renderer.getRenderOutput();
    };
  };

  var traverse = function traverse(fn) {
    return function (tree) {
      if (React.isValidElement(tree)) {
        fn(tree);
        React.Children.forEach(tree.props.children, traverse(fn));
      }
    };
  };

  var findRelevant = function findRelevant(tree) {
    var byId = {};
    var byClass = {};
    traverse(function (el) {
      if (el.props._tId !== undefined) {
        byId[el.props._tId] = el;
      }
      if (el.props._tClass !== undefined) {
        byClass[el.props._tClass] = (byClass[el.props._tClass] || []).concat([el]);
      }
    })(tree);
    return _extends({}, byClass, byId);
  };

  var renderToRelevant = function renderToRelevant(Comp) {
    return function (props) {
      return findRelevant(render(Comp)(props));
    };
  };

  var run = function run(Comp) {
    return function (fn) {
      var log = [];
      var renderer = TestUtils.createRenderer();
      var addToLog = function addToLog(entry) {
        log = log.concat([entry]);
      };
      var render = function render(props) {
        renderer.render(React.createElement(Comp, props));
      };
      fn(addToLog).forEach(function (event) {
        event(render, log);
        addToLog({ type: 'RELEVANT_ELEMENTS', payload: findRelevant(renderer.getRenderOutput()) });
      });
      return log;
    };
  };

  var findLatestElementsInLog = function findLatestElementsInLog(log) {
    var elements = null;
    log.forEach(function (entry) {
      if (entry.type === 'RELEVANT_ELEMENTS') {
        elements = entry.payload;
      }
    });
    return elements;
  };

  var createEvent = {
    updateProps: function updateProps(props) {
      return function (render) {
        return render(props);
      };
    },
    withElements: function withElements(fn) {
      return function (_, log) {
        var elements = findLatestElementsInLog(log);
        if (elements === null) {
          throw new Error('event withElements() can\'t be before at least one updateProps()');
        }
        fn(elements);
      };
    }
  };

  return { render: render, traverse: traverse, findRelevant: findRelevant, renderToRelevant: renderToRelevant, run: run, createEvent: createEvent, findLatestElementsInLog: findLatestElementsInLog };
};

module.exports = exports['default'];