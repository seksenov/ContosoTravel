var React = require('react');

var LocationSel = React.createClass({
  render: function() {
    return (
      <div id="destContainer">
        <div className="dest" id="dest1"></div>
        <div className="dest" id="dest2"></div>
        <div className="dest" id="dest3"></div>
        <div className="dest" id="dest4"></div>
      </div>
    );
  }
});

module.exports = LocationSel;
