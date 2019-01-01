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
          if (!this._map.widget._full) {
              this._updateLabelText({ text: 'Click map to place marker.' });
          }
          else {
              this._updateLabelText({ text: 'Marker is already set, click and drag it to relocate.' });
          }

          this._map.on('mousemove', this._onMouseMove, this);
        }
    }
});
