import { on } from 'ember-addons/ember-computed-decorators';
import TopicController from 'discourse/controllers/topic';
import DiscourseURL from 'discourse/lib/url';

export default {
  name: 'create-profile-notes-button',
  initialize(container) {
    const ButtonView = container.lookupFactory('view:button');
    const MainButtons = container.lookupFactory('view:topic-footer-main-buttons');
    const user = container.lookup('current-user:main');

    const CreateProfileNotes = ButtonView.extend({
      text: 'Save',
      title: 'Save this conversation to a User Note',

      click: function() {
        var controller = this.get('controller');
        var postStream = controller.get('model.postStream');
        Discourse.ajax("/create_profile_notes/add", {
          type: "POST",
          data: {
            topic_id: controller.get('content.id')
          }
        }).then(function(){
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

    TopicController.reopen({
      actions: {
        goToUser: function(username) {
          DiscourseURL.routeTo("/users/" + username);
          return false;
        }
      }
    });

    MainButtons.reopen({
      @on('additionalButtons')
      addCreateProfileNotesButton() {
        if (user && user.staff && this.get('controller.content.archetype') == 'private_message') {
          this.attachViewClass(CreateProfileNotes);
        }
      }
    });
  }
}
