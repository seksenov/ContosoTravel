var React = require('react');
var $ = require('jquery');
var moment = require('moment');

require('jquery-ui');

var DateSel = React.createClass({
  getInitialState: function() {
    return {
      departure: {},
      returning: {},
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
    this.setState({departure: 'Pick a date...' });
    this.setState({returning: 'Pick a date...' });
    this.dp.on('change', function() {
      var date = that.dp.datepicker('getDate');
      fdate = moment(date).format(dateFormat);
      var dateObj = {};
      dateObj[that.state.changing] = fdate;
      that.setState(dateObj);
      that.dp.hide();
    });
  },
  handleClick: function(val) {
    this.setState({changing: val});
    this.dp.toggle();
  },
  handleConfirm: function() {
    this.props.onDatesSelected();
  },
  render: function() {
    return (
      <div>
        <div id="calendarContainer">
          <div id="textDateContainer">
            <div className="dateText" id="departure" onClick={this.handleClick.bind(this, 'departure')}>Departure: {this.state.departure}</div> 
            <div className="dateText" id="returning" onClick={this.handleClick.bind(this, 'returning')}>Return: {this.state.returning}</div> 
            <button onClick={this.handleConfirm}>Confirm</button>
          </div>
          <div id="datepicker" className="calendar"></div>
        </div>
        <div className ={this.props.currentCity + "Second background"}></div>
      </div>
    );
  }
});

module.exports = DateSel;
