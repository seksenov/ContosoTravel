var React = require('react');

var ContactSel = React.createClass({
  handleClick: function() {
    this.props.winAPI();
  },
  render: function() {
    return (
      <div>
        <button onClick={this.handleClick} id="friendButton">Take a Friend</button>
        {this.props.contacts.map(function(contact, i) {
          return (
              <div>
                {contact.image}
                <div>{contact.name}</div>
              </div>
          );
        }, this)}
        <div id="contactBg"></div>
      </div>
    );
  }
});

module.exports = ContactSel;
