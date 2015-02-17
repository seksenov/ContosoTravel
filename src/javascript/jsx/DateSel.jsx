var React = require('react');
var $ = require('jquery');

require('jquery-ui');

var DateSel = React.createClass({
  componentDidMount: function() {
    $('#calendar').datepicker();
  },
  render: function() {
    return (
      <div id="calendar" className=""></div>
    );
  }
});

module.exports = DateSel;
