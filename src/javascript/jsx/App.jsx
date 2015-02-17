var React = require('react');
var fullpage = require('fullPage');

var LocationSel = require('./LocationSel.jsx');
var DateSel = require('./DateSel.jsx');
var ContactSel = require('./ContactSel.jsx');


var App = React.createClass({
  componentDidMount: function() {
    fullpage('#main', {
      resize: false,
      navigation: true,
      css3:true
    });
  },
  render: function() {
    return (
      <div id="main">
        <div className="section">
          <LocationSel></LocationSel>
        </div>
        <div className="section">
          <DateSel></DateSel>
        </div>
        <div className="section">
          <ContactSel></ContactSel>
        </div>
      </div>
    );
  }
});

module.exports = App;
