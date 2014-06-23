# name: create-profile-note
# about: copy a topic into a note
# authors: Jude Aakjaer

after_initialize do
  module ::CreateProfileNotesPlugin
    class Engine < ::Rails::Engine
      engine_name "create_profile_notes_plugin"
      isolate_namespace CreateProfileNotesPlugin
    end

    class CreateProfileNotesController < ActionController::Base
      include CurrentUser
      before_filter :ensure_staff_user

      def add
        if params[:topic_id].nil?
          render status: 400, json: false
          return
        end

        topic = ::Topic.where(id: params[:topic_id], archetype: :private_message).first

        if topic.nil? || target.nil?
          render_forbidden
          return
        end

        notes.add_note(topic.posts.first.raw, true, {topic_id: params[:topic_id]})
        render status: :ok, json: false
      end

      private

      def render_forbidden
        render status: :forbidden, json: false
      end

      def ensure_staff_user
        render_forbidden if !current_user.staff?
      end

      def target
        @_target ||= User.find(params[:target_id])
      end

      def notes
        @_notes ||= ProfileNotesPlugin::ProfileNotes.new(target, current_user)
      end
    end
  end

  CreateProfileNotesPlugin::Engine.routes.draw do
    post '/add' => 'create_profile_notes#add'
  end

  Discourse::Application.routes.append do
    mount ::CreateProfileNotesPlugin::Engine, at: '/create_profile_notes'
  end
end

# Register UI Components
register_asset "javascripts/create_profile_notes_button.js"
