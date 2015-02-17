var React = require('react');
var $ = require('jquery');

require('jquery-ui');

var DateSel = React.createClass({
  componentDidMount: function() {
    $('#datepicker').datepicker();
  },
  render: function() {
    return (
      <div>
        <div id="calendarContainer">
          <div id="datepicker" className="calendar"></div>
        </div>
        <div id="background" className ={this.props.currentCity}></div>
      </div>
    );
  }
});

module.exports = DateSel;
