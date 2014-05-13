// Generated by CoffeeScript 1.7.1
$(document).ready(function() {
  var GarmentCollection, GarmentModel, GarmentView, ToolbarView, garmentCollection;
  GarmentModel = Backbone.Model.extend({
    defaults: {
      angle: 0,
      height: 0,
      image: null,
      offset: {
        left: 0,
        top: 0
      },
      sizeRatio: 100,
      width: 0
    }
  });
  ToolbarView = Backbone.View.extend({
    className: 'toolbar-wrapper',
    events: {
      'click .close-toolbar': function() {
        return this.remove();
      },
      'click .flip-garment': function() {
        var imageName;
        imageName = this.model.get('image');
        if (imageName.indexOf('front') !== -1) {
          imageName = imageName.replace('front', 'back');
        } else {
          imageName = imageName.replace('back', 'front');
        }
        return this.model.set('image', imageName);
      },
      'click .delete-garment': function() {
        return this.model.destroy();
      },
      'slide .rotate-slider': function(ev, ui) {
        return this.model.set('angle', ui.value);
      },
      'slide .resize-slider': function(ev, ui) {
        return this.model.set('sizeRatio', ui.value);
      }
    },
    initialize: function() {
      return this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.find('.rotate-slider').slider({
        animate: 'slow',
        max: 180,
        min: -180,
        slide: function(ev, ui) {
          return $(this).next().attr('data-value', ui.value).text(ui.value);
        },
        value: this.model.get('angle')
      });
      this.$el.find('.resize-slider').slider({
        animate: 'slow',
        max: 200,
        min: 1,
        slide: function(ev, ui) {
          return $(this).next().attr('data-value', ui.value).text(ui.value);
        },
        value: this.model.get('sizeRatio')
      });
      return this;
    },
    template: _.template($.trim($('#toolbar-template').html()))
  });
  GarmentView = Backbone.View.extend({
    events: {
      'dblclick': 'renderToolbar'
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      return this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.draggable().offset(this.model.offset).rotate(this.model.get('angle'));
      this.$el.attr('src', this.model.get('image'));
      this.$el.height(this.model.get('height') * this.model.get('sizeRatio') / 100);
      return this.$el.width(this.model.get('width') * this.model.get('sizeRatio') / 100);
    },
    renderToolbar: function() {
      var newToolbarView;
      $('.toolbar-wrapper').remove();
      newToolbarView = new ToolbarView({
        model: this.model
      });
      newToolbarView.render().$el.appendTo('body');
    },
    tagName: 'img'
  });
  GarmentCollection = Backbone.Collection.extend({
    model: GarmentModel
  });
  garmentCollection = new GarmentCollection();
  $('.garment').draggable({
    helper: 'clone'
  });
  return $('.drop-area > .target').droppable({
    drop: function(ev, ui) {
      var newGarmentImage, newGarmentModel, newGarmentView;
      if (ui.draggable.hasClass('source')) {
        newGarmentModel = garmentCollection.add({
          height: ui.helper.height(),
          image: ui.helper.attr('src'),
          offset: ui.helper.offset(),
          width: ui.helper.width()
        });
        newGarmentView = new GarmentView({
          model: newGarmentModel
        });
        newGarmentImage = ui.helper.clone();
        newGarmentImage.appendTo(this).draggable({
          containment: '.drop-area > .target',
          stack: '.garment'
        }).offset(ui.helper.offset()).toggleClass('source', false);
        newGarmentView.setElement(newGarmentImage);
      }
    }
  });
});