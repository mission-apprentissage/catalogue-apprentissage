exports.__esModule = true;

var _extends =
  Object.assign ||
  function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _helper = require("@appbaseio/reactivecore/lib/utils/helper");

var _Button = require("@appbaseio/reactivesearch/lib/styles/Button");

var _Button2 = _interopRequireDefault(_Button);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true },
  });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
}

function getStartPage(totalPages, currentPage, showEndPage) {
  var midValue = parseInt(totalPages / 2, 10);
  var start = currentPage - (showEndPage ? Math.ceil(midValue / 2) - 1 : midValue);
  return start > 1 ? start : 2;
}

var buildPaginationDOM = function buildPaginationDOM(props, position) {
  var pages = props.pages,
    currentPage = props.currentPage,
    setPage = props.setPage,
    totalPages = props.totalPages,
    innerClass = props.innerClass,
    fragmentName = props.fragmentName,
    showEndPage = props.showEndPage;

  var start =
    position === "start"
      ? getStartPage(pages, currentPage, showEndPage)
      : Math.max(2, Math.ceil(totalPages - (pages - 1) / 2 + 1));
  var paginationButtons = [];
  if (start <= totalPages) {
    var totalPagesToShow = pages < totalPages ? start + (pages - 1) : totalPages + 1;
    if (showEndPage) {
      totalPagesToShow = position === "start" ? start + (Math.ceil(pages / 2) - (pages % 2)) : totalPages + 1;
    }
    if (currentPage > totalPages - pages + 2) {
      start = Math.max(2, totalPages - pages + 2);
      totalPagesToShow = start + pages;
    }

    var _loop = function _loop(i) {
      var primary = currentPage === i - 1;
      var innerClassName = (0, _helper.getClassName)(innerClass, "button");
      var className = innerClassName || primary ? innerClassName + " " + (primary ? "active" : "") : null;
      var pageBtn = _react2.default.createElement(
        _Button2.default,
        {
          className: className,
          primary: primary,
          key: i - 1,
          tabIndex: "0",
          onKeyPress: function onKeyPress(event) {
            return (0, _helper.handleA11yAction)(event, function () {
              return setPage(i - 1);
            });
          },
          onClick: function onClick(e) {
            e.preventDefault();
            setPage(i - 1);
          },
          alt: "Page " + i,
          href: "?" + fragmentName + "=" + i,
        },
        i
      );
      if (i <= totalPages + 1) {
        paginationButtons.push(pageBtn);
      }
    };

    for (var i = start; i < Math.min(totalPages + 1, totalPagesToShow); i += 1) {
      _loop(i);
    }
  }
  return paginationButtons;
};

var Pagination = (function (_React$PureComponent) {
  _inherits(Pagination, _React$PureComponent);

  function Pagination() {
    _classCallCheck(this, Pagination);

    return _possibleConstructorReturn(this, _React$PureComponent.apply(this, arguments));
  }

  Pagination.prototype.buildIntermediatePaginationDom = function buildIntermediatePaginationDom() {
    var _props = this.props,
      showEndPage = _props.showEndPage,
      currentPage = _props.currentPage,
      totalPages = _props.totalPages,
      pages = _props.pages;

    if (!showEndPage) return buildPaginationDOM(this.props, "start");
    if (currentPage <= totalPages - pages + 2 || totalPages <= pages) {
      return buildPaginationDOM(this.props, "start");
    }
    return null;
  };

  Pagination.prototype.render = function render() {
    var _props2 = this.props,
      pages = _props2.pages,
      currentPage = _props2.currentPage,
      setPage = _props2.setPage,
      totalPages = _props2.totalPages,
      innerClass = _props2.innerClass,
      fragmentName = _props2.fragmentName,
      showEndPage = _props2.showEndPage;

    if (!totalPages) {
      return null;
    }

    var onPrevPage = function onPrevPage(e) {
      e.preventDefault();
      if (currentPage) {
        setPage(currentPage - 1);
      }
    };

    var onNextPage = function onNextPage(e) {
      e.preventDefault();
      if (currentPage < totalPages - 1) {
        setPage(currentPage + 1);
      }
    };

    var innerClassName = (0, _helper.getClassName)(innerClass, "button");
    var primary = currentPage === 0;
    var className = innerClassName || primary ? innerClassName + " " + (primary ? "active" : "") : null;

    var prevHrefProp = {};
    var nextHrefProp = {};

    if (currentPage >= 1) {
      prevHrefProp = {
        href: "?" + fragmentName + "=" + currentPage,
        alt: "Page " + currentPage,
        rel: "prev",
      };
    }

    if (currentPage < totalPages - 1) {
      nextHrefProp = {
        href: "?" + fragmentName + "=" + (currentPage + 2),
        rel: "next",
        alt: "Page " + (currentPage + 2),
      };
    }
    return _react2.default.createElement(
      "div",
      { className: _Button.pagination + " " + (0, _helper.getClassName)(innerClass, "pagination") },
      _react2.default.createElement(
        _Button2.default,
        _extends(
          {
            className: (0, _helper.getClassName)(innerClass, "button") || null,
            disabled: currentPage === 0,
            onKeyPress: function onKeyPress(event) {
              return (0, _helper.handleA11yAction)(event, onPrevPage);
            },
            onClick: onPrevPage,
            tabIndex: currentPage === 0 ? "-1" : "0",
          },
          prevHrefProp
        ),
        "Précédent"
      ),
      _react2.default.createElement(
        _Button2.default,
        {
          className: className,
          primary: primary,
          onKeyPress: function onKeyPress(event) {
            return (0, _helper.handleA11yAction)(event, function () {
              return setPage(0);
            });
          },
          onClick: function onClick(e) {
            e.preventDefault();
            setPage(0);
          },
          tabIndex: "0",
          href: "?" + fragmentName + "=1",
          alt: "Page 1",
        },
        "1"
      ),
      showEndPage && currentPage >= Math.floor(pages / 2) + !!(pages % 2)
        ? _react2.default.createElement("span", null, "...")
        : null,
      this.buildIntermediatePaginationDom(),
      showEndPage && pages > 2 && currentPage <= totalPages - Math.ceil(pages * 0.75)
        ? _react2.default.createElement("span", null, "...")
        : null,
      showEndPage && totalPages >= pages && buildPaginationDOM(this.props, "end"),
      _react2.default.createElement(
        _Button2.default,
        _extends(
          {
            className: (0, _helper.getClassName)(innerClass, "button") || null,
            disabled: currentPage >= totalPages - 1,
            onKeyPress: function onKeyPress(event) {
              return (0, _helper.handleA11yAction)(event, onNextPage);
            },
            onClick: onNextPage,
            tabIndex: currentPage >= totalPages - 1 ? "-1" : "0",
          },
          nextHrefProp
        ),
        "Suivant"
      )
    );
  };

  return Pagination;
})(_react2.default.PureComponent);

exports.default = Pagination;
