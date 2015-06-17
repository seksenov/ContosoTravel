var React = require('react');
var fullpage = require('fullPage');

var LocationSel = require('./LocationSel.jsx');
var DateSel = require('./DateSel.jsx');
var ContactSel = require('./ContactSel.jsx');
var ConfirmationPage = require('./ConfirmationPage.jsx');
var AddtoCal = require('./AddtoCal.jsx');

var plugins = require('plugins');

var App = React.createClass({
  getInitialState: function() {
    return {
      cityIdx: 0,
      dates: {},
      contacts: ''
    };
  },
  cities: [
    'San Francisco', 
    'New York',
    'Chicago',
    'Seattle'
  ],
  getClickedCityIdx: function(idx) {
    this.setState({cityIdx: idx}, function() {
      fullpage.controls.moveTo(2);
    });
  },
  getSelectedDates: function(selection) {
    this.setState({dates: selection});
    fullpage.controls.moveTo(3);
  },
  callContactsAPI: function() {
    plugins.addContact(function(contact, err) {
      if (err) {
        console.log(err);
      } else {
        this.setState({contacts: contact.name});
      }
    }.bind(this));
  },
  advanceSlide: function(slideNum) {
    fullpage.controls.moveTo(slideNum);
  },
  callAppointmentAPI: function() {
    plugins.addAppointment(fullpage.controls.moveTo.bind(this, 5), this.state.dates.departure, this.cities[this.state.cityIdx]);
  },
  componentDidMount: function() {
    fullpage.init('#main', {
      resize: false,
      navigation: true,
      css3:true
    });
  },
  render: function() {
    return (
      <div id="main">
        <div className="section">
          <LocationSel onClick={this.advancePage} cities={this.cities} onChosenCity={this.getClickedCityIdx}></LocationSel>
        </div>
        <div className="section">
          <DateSel onDatesSelected={this.getSelectedDates} currentCity={this.cities[this.state.cityIdx]}></DateSel>
        </div>
        <div className="section">
          <ContactSel ref="contactSel" contacts={this.state.contacts} winAPI={this.callContactsAPI} advanceSlide={this.advanceSlide}></ContactSel>
        </div>
        <div className="section">
          <AddtoCal winAPI={this.callAppointmentAPI}></AddtoCal>
        </div>
        <div className="section">
          <ConfirmationPage city={this.cities[this.state.cityIdx]} dates={this.state.dates}></ConfirmationPage>
        </div>
      </div>
    );
  }
});

module.exports = App;
