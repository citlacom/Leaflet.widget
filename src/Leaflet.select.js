L.Control.Draw.mergeOptions({
    select: {
        title: 'Select items'
    }
});

// TODO: Remove hack to 'open' class.
var onAdd = L.Control.Draw.prototype.onAdd;

L.Control.Draw.include({
    onAdd: function (map) {
        var className = 'leaflet-control-draw',
            container = onAdd.call(this, map);

        if (this.options.select) {
            this.handlers.select = new L.Handler.Select(map, this.options.select);
            this._createButton(
                    this.options.select.title,
                    className + '-select',
                    container,
                    this.handlers.select.enable,
                    this.handlers.select
            );
            this.handlers.select.on('activated', this._disableInactiveModes, this);
        }

        return container;
    }
});

L.Handler.Select = L.Handler.extend({
    includes: L.Mixin.Events,

    initialize: function (map, options) {
        this._map = map;
    },

    enable: function () {
        // this.fire('activated');
        // L.Handler.prototype.enable.call(this);
        this._myEnabled = true;
    },

    disable: function () {
        // L.Handler.prototype.disable.call(this);
        this._myEnabled = false;
    },

    enabled: function () {
        // return L.Handler.prototype.enabled.call(this);
        return this._myEnabled;
    },

    // Called when handler is enabled.
    addHooks: function () {
        if (this._map) {
            this._selected = L.layerGroup()
            this._map.on({
                layeradd: this._bind,
                layerremove: this._unbind
            }, this);
        }
    },

    // Called when handler is disabled.
    removeHooks: function () {
        if (this._map) {
            // Clean up selected layers.
            this.applyToSelected(function (layer) {
                layer.off('click', this.select);
                layer.off('click', this.deselect);
                this._selected.removeLayer(layer);
            }, this);
            delete this._selected;

            this._map.off({
                layeradd: this._bind,
                layerremove: this._unbind
            }, this);
        }
    },

    select: function (e) {
        var layer = e.layer;
        layer.off('click', this.select);
        layer.on('click', this.deselect, this);
        this._selected.addLayer(layer);
        this._map.fire('selected', { layer: layer });
    },

    deselect: function (e) {
        var layer = e.layer;
        layer.off('click', this.deselect);
        layer.on('click', this.select, this);
        this._selected.removeLayer(layer);
        this._map.fire('deselected', { layer: layer });
    },

    applyToSelected: function (callback, context) {
        this._selected.eachLayer(callback, context);
    },

    _bind: function (e) {
        var layer = e.layer;
        if (layer instanceof L.Marker || layer instanceof L.Path) {
            layer.on('click', this.select, this);
        }
    },

    _unbind: function (e) {
        var layer = e.layer;
        if (layer instanceof L.Marker || layer instanceof L.Path) {
            this._selected.removeLayer(layer);
            layer.off('click');
        }
    }
});

//L.Map.addInitHook('addHandler', 'select', L.Map.Select);

L.Control.Select = L.Control.extend({
    options: {
        position: 'bottomright',
        delete: true
    },

    onAdd: function (map) {
        this._map = map;

        var class_name = 'leaflet-select-control',
            container = L.DomUtil.create('div', class_name);

        if (this.options.delete) {
            this._createButton('Delete selected features', class_name + '-delete', container, this._delete, this);
        }

        return container;
    },

    _delete: function () {
        this._map.select.applyToSelected(function (layer) {
            this._map.removeLayer(layer);
        }, this);
    },

    _createButton: function (title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.href = '#';
        link.title = title;

        L.DomEvent
                .on(link, 'click', L.DomEvent.stopPropagation)
                .on(link, 'mousedown', L.DomEvent.stopPropagation)
                .on(link, 'dblclick', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.preventDefault)
                .on(link, 'click', fn, context);

        return link;
    }
});

L.Map.addInitHook(function () {
    if (this.options.select) {
        this.selectControl = new L.Control.Select();
        this.addControl(this.selectControl);
    }
});

L.Control.select = function (options) {
    return new L.Control.Select(options);
};