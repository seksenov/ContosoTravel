var React = require('react');
var $ = require('jquery');

require('jquery-ui');

var DateSel = React.createClass({
  getInitialState: function() {
    return {
      departure: '',
      arrival:'' 
    };
  },
  dp: {},
  componentDidMount: function() {
    this.dp = $('#datepicker').datepicker().hide();
    var that = this;
    this.setState({departure: this.dp.datepicker('getDate')});
    this.dp.on('change', function() {
      var date = that.dp.datepicker('getDate');
      console.log(typeof date);
      that.setState({departure: date});
      that.dp.hide();
    });
  },
  confirmDates: function() {
  },
  handleClick: function() {
    this.dp.toggle();
  },
  render: function() {
    return (
      <div>
        <div id="calendarContainer">
          <div id="textDateContainer">
            <div id="departure" onClick={this.handleClick}>Click{this.state.departure}</div> 
            <div id="arrival" onClick={this.handleClick}>Click</div> 
          </div>
          <div id="datepicker" className="calendar"></div>
        </div>
        <div id="background" className ={this.props.currentCity}></div>
      </div>
    );
  }
});

module.exports = DateSel;
