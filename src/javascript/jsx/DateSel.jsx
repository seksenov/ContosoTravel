var React = require('react');
var $ = require('jquery');
var moment = require('moment');

require('jquery-ui');

var DateSel = React.createClass({
  getInitialState: function() {
    return {
      departure: {},
      arrival: {},
      changing: ''
    };
  },
  dp: {},
  componentDidMount: function() {
    var dateFormat = 'dddd, Do MMM YYYY';
    this.dp = $('#datepicker').datepicker().hide();
    var that = this;
    var date = this.dp.datepicker('getDate');
    var fdate = moment(date).format(dateFormat);
    this.setState({departure: fdate});
    this.setState({arrival: fdate});
    this.dp.on('change', function() {
      var date = that.dp.datepicker('getDate');
      fdate = moment(date).format(dateFormat);
      var dateObj = {};
      dateObj[that.state.changing] = fdate;
      that.setState(dateObj);
      that.dp.hide();
    });
  },
  confirmDates: function() {
  },
  handleClick: function(val) {
    this.setState({changing: val});
    this.dp.toggle();
  },
  render: function() {
    return (
      <div>
        <div id="calendarContainer">
          <div id="textDateContainer">
            <div id="departure" onClick={this.handleClick.bind(this, 'departure')}>{this.state.departure}</div> 
            <div id="arrival" onClick={this.handleClick.bind(this, 'arrival')}>{this.state.arrival}</div> 
          </div>
          <div id="datepicker" className="calendar"></div>
        </div>
        <div id="background" className ={this.props.currentCity}></div>
      </div>
    );
  }
});

module.exports = DateSel;
