'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

module.exports = function (React, TestUtils) {

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

  var mapOverRenders = function mapOverRenders(fn) {
    return function (log) {
      return log.filter(function (x) {
        return x && x.type === 'RENDER';
      }).map(function (x) {
        return fn(x.payload);
      });
    };
  };

  var lastRendered = function lastRendered(log) {
    var xs = mapOverRenders(function (x) {
      return x;
    })(log);
    return xs.length > 0 ? xs[xs.length - 1] : null;
  };

  var eventCreators = {
    triggerCallback: function triggerCallback(elementName, callbackName) {
      var args = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
      var context = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

      return function (_ref) {
        var log = _ref.log;

        lastRendered(log)[elementName].props[callbackName].apply(context, args);
      };
    },
    setProps: function setProps(props) {
      return function (_ref2) {
        var setProps = _ref2.setProps;

        setProps(props);
      };
    }
  };

  var eventsToLog = function eventsToLog(Comp) {
    return function (events) {
      var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref3$before = _ref3.before;
      var before = _ref3$before === undefined ? function () {} : _ref3$before;
      var _ref3$after = _ref3.after;
      var after = _ref3$after === undefined ? function () {} : _ref3$after;

      var log = [];
      var context = {};
      var renderer = TestUtils.createRenderer();
      var addToLog = function addToLog(entry) {
        log = log.concat([entry]);
      };
      var setProps = function setProps(props) {
        renderer.render(React.createElement(Comp, props));
      };
      before(context);
      events.forEach(function (event) {
        event({ context: context, setProps: setProps, addToLog: addToLog, log: log });
        addToLog({
          type: 'RENDER',
          payload: findRelevant(renderer.getRenderOutput())
        });
      });
      after(context);
      return log;
    };
  };

  return {
    render: render,
    traverse: traverse,
    findRelevant: findRelevant,
    renderToRelevant: renderToRelevant,
    eventsToLog: eventsToLog,
    lastRendered: lastRendered,
    mapOverRenders: mapOverRenders,
    eventCreators: eventCreators
  };
};