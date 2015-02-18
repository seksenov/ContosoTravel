var React = require('react');

var AddtoCal = React.createClass({
  render: function() {
    return (
      <div>
        <button id="friendButton">Add to Calendar</button>
        <div id="contactBg"></div>
      </div>
    );
  }
});

module.exports = AddtoCal;
