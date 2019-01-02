L.Marker.mergeOptions({
    draggable: true
});

L.Marker.include({
    toGeometry: function () {
        return {
            type: "Point",
            coordinates: L.GeoJSONUtil.latLngToCoord(this.getLatLng())
        };
    },
    toGeoJSON: function () {
        return L.GeoJSONUtil.feature(this.toGeometry());
    }
});

// Disable marker tool when cardinality is full.
L.Marker.Draw.include({
    baseOnMouseMove: L.Marker.Draw.prototype._onMouseMove,
    _onMouseMove: function (e) {
        if (!this._map.widget._full) {
            this.baseOnMouseMove(e);
        }
    },

    addHooks: function () {
        L.Handler.Draw.prototype.addHooks.call(this);
        if (this._map) {
          if (this._map.widget._full) {
              this._updateLabelText({ text: 'Marker is already placed. Click and drag to relocate.' });
              // Dismiss warning popup when marker or map layers are clicked so
              // message don't disturb marker relocation.
              this._map.off('click', this._onClick, this);
              this._map.on('click', this.dismissWarning, this);

              if (this._map.drawControl.handlers.select.options.selectable) {
                  var selectable = this._map.drawControl.handlers.select.options.selectable;
                  selectable.eachLayer(function (layer) {
                      layer.on('click', this.dismissWarning, this);
                      layer.on('drag', this.dismissWarning, this);
                  }, this);
              }
          }
          else {
              this._updateLabelText({ text: 'Click map to place marker.' });
          }

          this._map.on('mousemove', this._onMouseMove, this);
        }
    },

    baseRemoveHooks: L.Marker.Draw.prototype.removeHooks,
    removeHooks: function() {
        this.baseRemoveHooks();
        this._map.off('click', this.dismissWarning, this);

        if (this._map.drawControl.handlers.select.options.selectable) {
            var selectable = this._map.drawControl.handlers.select.options.selectable;
            selectable.eachLayer(function (layer) {
                layer.off('click', this.dismissWarning, this);
                layer.off('drag', this.dismissWarning, this);
            }, this);
        }
    },

    dismissWarning: function(e) {
        this.disable();
    }
});
