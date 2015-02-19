var React = require('react');

var ContactSel = React.createClass({
  handleClick: function() {
    this.props.winAPI();
    console.log(this.props.contacts);
  },
  render: function() {
    return (
      <div>
        <button onClick={this.handleClick} id="friendButton">Take a Friend</button>
        <div id="contactName">{this.props.contacts}</div>
        <div className="Friends background"></div>
      </div>
    );
  }
});

module.exports = ContactSel;
