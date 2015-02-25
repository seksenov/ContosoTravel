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
    var that = this;
    this.props.onDatesSelected({
      departure: that.state.departure,
      returning: that.state.returning
    });
  },
  render: function() {
    return (
      <div>
      <div className="paneContainer">
        <span className="stepLabel">Step # of 5</span>
        <h2 className="paneTitle">When do you want to go?</h2>
        <div className="paneContent">
            <div className="dateText" id="departure" onClick={this.handleClick.bind(this, 'departure')}>Departure: <span className="dateClickable">{this.state.departure}</span></div> 
            <div className="dateText" id="returning" onClick={this.handleClick.bind(this, 'returning')}>Return: <span className="dateClickable">{this.state.returning}</span></div> 
        </div>
        <div class="paneButtons">
            <button className="confirmButton action-button button-animate blue" onClick={this.handleConfirm}>Confirm</button>
            <button className="confirmButton action-button button-animate blue" onClick={this.handleConfirm}>Confirm</button>
            </div>
        <div id="calendarContainer">
          <div id="datepicker" className="calendar"></div>
        </div>
      </div>
        <div className ={this.props.currentCity + "Second background"}></div>
      </div>
    );
  }
});

module.exports = DateSel;
