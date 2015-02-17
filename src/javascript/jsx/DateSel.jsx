var React = require('react');
var $ = require('jquery');

//require('jquery-ui');
require('multiDatesPicker');

var DateSel = React.createClass({
  componentDidMount: function() {
    //$('#datepicker').datepicker();
    $('#datepicker').multiDatesPicker({
      maxPicks: 2
    });
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
