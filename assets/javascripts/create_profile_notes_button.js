Discourse.AlertButton = Discourse.ButtonView.extend({
  text: 'Save',
  title: 'Save this conversation to a User Note',

  click: function() {
    this.set('loading', true);
    controller = this.get('controller');
    postStream = controller.get('postStream');
    Discourse.ajax("/create_profile_notes/add", {
      type: "POST",
      data: {
        topic_id: controller.get('content.id')
      }
    }).then(function(){
      this.set('loading', false);
      this.set('text', 'Saved');
      postStream.get('topic.details.allowed_users').every(function(user){
        if (user.username != controller.get('currentUser.username')) {
          controller.send('goToUser', user.username);
          return false;
        }
      });
    }.bind(this));
  },

  renderIcon: function(buffer) {
    buffer.push("<i class='fa fa-comment'></i>");
  }
});

Discourse.TopicController.reopen({
  actions: {
    goToUser: function(username) {
      Discourse.URL.routeTo("/users/" + username);
      return false;
    }
  }
})

Discourse.TopicFooterButtonsView.reopen({
  addAlertButton: function() {
    if (this.get('controller.currentUser.staff') && this.get('controller.content.archetype') == 'private_message') {
      this.attachViewClass(Discourse.AlertButton);
    }
  }.on("additionalButtons")
});
