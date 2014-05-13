$(document).ready ->

  # Backbone

  GarmentModel = Backbone.Model.extend
    defaults:
      angle: 0
      height: 0
      image: null
      offset:
        left: 0
        top: 0
      sizeRatio: 100
      width: 0

  ToolbarView = Backbone.View.extend

    className: 'toolbar-wrapper'

    events:
      'click .close-toolbar': ->
        this.remove()
      'click .flip-garment': ->
        imageName = @model.get('image')
        if imageName.indexOf('front') != -1 # front image
          imageName = imageName.replace('front', 'back')
        else
          imageName = imageName.replace('back', 'front')
        @model.set('image', imageName)

      'click .delete-garment': ->
        this.model.destroy()
      'slide .rotate-slider': (ev, ui) ->
        @model.set('angle', ui.value)
      'slide .resize-slider': (ev, ui) ->
        @model.set('sizeRatio', ui.value)

    initialize: ->
      @listenTo(@model, 'destroy', @remove)

    render: ->
      @$el.html @template(@model.toJSON())
      @$el.find('.rotate-slider').slider
        animate: 'slow'
        max: 180
        min: -180
        slide: (ev, ui) ->
          $(this).next().attr('data-value', ui.value).text(ui.value)
        value: @model.get('angle')
      @$el.find('.resize-slider').slider
        animate: 'slow'
        max: 200
        min: 1
        slide: (ev, ui) ->
          $(this).next().attr('data-value', ui.value).text(ui.value)
        value: @model.get('sizeRatio')
      this

    template: _.template($.trim($('#toolbar-template').html()))

  GarmentView = Backbone.View.extend

    events:
      'dblclick': 'renderToolbar'
    
    initialize: ->
      @listenTo(@model, 'change', @render)
      @listenTo(@model, 'destroy', @remove)

    render: ->
      @$el.draggable().offset(@model.offset).rotate(@model.get('angle'))
      @$el.attr('src', @model.get('image'))
      @$el.height(@model.get('height') * @model.get('sizeRatio') / 100)
      @$el.width(@model.get('width') * @model.get('sizeRatio') / 100)

    renderToolbar: ->
      $('.toolbar-wrapper').remove()
      newToolbarView = new ToolbarView model: @model
      newToolbarView.render().$el.appendTo('body')
      return

    tagName: 'img'

  GarmentCollection = Backbone.Collection.extend
    model: GarmentModel

  # Initialize

  garmentCollection = new GarmentCollection()

  $('.garment').draggable
    helper: 'clone'

  $('.drop-area > .target').droppable
    drop: (ev, ui) ->
      if ui.draggable.hasClass('source')
        newGarmentModel = garmentCollection.add
          height: ui.helper.height()
          image: ui.helper.attr('src')
          offset: ui.helper.offset()
          width: ui.helper.width()

        # Actual image element
        newGarmentView = new GarmentView
          model: newGarmentModel

        newGarmentImage = ui.helper.clone()
        newGarmentImage.appendTo(this)
        .draggable
          containment: '.drop-area > .target'
          stack: '.garment'
        .offset(ui.helper.offset())
        .toggleClass('source', false)

        newGarmentView.setElement(newGarmentImage)

        # Toolbar

        return

