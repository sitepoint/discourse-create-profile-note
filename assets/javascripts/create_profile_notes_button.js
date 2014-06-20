Discourse.AlertButton = Discourse.ButtonView.extend({
  text: 'Save',
  title: 'Save this conversation to a User Note',

  click: function() {
    this.set('loading', true);
    firstPost = this.get('controller.postStream.firstLoadedPost');
    Discourse.ajax("/create_profile_notes/add", {
      type: "POST",
      data: {
        topic_id: this.get('controller.content.id'),
        target_id: firstPost.user_id
      }
    }).then(function(){
      this.set('loading', false);
      this.set('text', 'Saved');
      this.get('controller').send('goToUser', firstPost.username);
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
