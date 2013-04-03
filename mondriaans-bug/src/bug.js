// This is the class definition for the composition, look in index.html
// on how we initialize the class
function Bug( conf ) {
    // This is needed because the 'this' variable goes out of scope on event
    // handlers like the image.onload event handler
    var self = this;

    // Make class properties of some of the configuration variables
    this.el = conf.el;
    this.imgsrc = conf.imgsrc;
    this.height = conf.height;
    this.multiplier = conf.multiplier;
    this.width = conf.width;

    // Get the 'context' so we can actually draw something on the canvas
    this.ctx = this.el.getContext('2d');

    // Create a new empty image that we can use later on to load our PNG file
    this.image = new Image();
    this.imgdata = null;

    // Whenever the image has been loaded load the image data and draw
    // the new composition
    self.image.onload = function() {
        self.handleLoadImage();
        self.draw();
    };

    // Set the source to the image file, kicking off the whole thing
    this.image.src = this.imgsrc;
}

Bug.prototype = {
    calc : function(x, y) {
        var c = this.getPixel(x, y);

        // Here is where the 'magic' happens, because multiplier can be a
        // float we can get 'invalid' (non-integer) numbers that do weird
        // stuff when used in the fillStyle property of a canvas
        return c.map(function(a) {
            return a * this.multiplier;
        }, this);
    },

    // Loop over all pixels in the grid, get the color, transform it
    // and re-draw on the grid again
    draw : function() {
        for (var x = 1; x < this.width - 1; x++) {
            for (var y = 1; y < this.height - 1; y++) {
                var rgb = this.calc(x, y);
                var color = 'rgb(' + rgb.join(',') + ')';

                // See the comment for calc(), because the bug only occurs with
                // fillStyle we can't directly re-map all values (which would
                // be a lot faster)
                this.ctx.fillStyle = color;

                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    },

    // Canvas image data is structered like one long array with rgba elements,
    // so for example, let's say the first pixel (0,0) is completely red
    // you'll get something like this:
    // [255, 0, 0, 255]
    getPixel : function(x, y) {
        // Convert x/y to a starting point in the array index
        var i = (y * this.width + x) * 4;
        var buffer = this.imgdata.data;

        // Return the r, g and b values
        return [
            buffer[i], buffer[i + 1], buffer[i + 2]
        ];
    },

    // Used to return the canvas as a PNG file for saving
    getPng : function() {
        return this.el.toDataURL("image/png");
    },

    handleLoadImage : function( callback ) {
        // Set the element width and height to the height we've given
        // in the constructor
        this.el.width = this.width;
        this.el.height = this.height;

        // Draw the data from the image on the canvas
        this.ctx.drawImage(this.image, 0, 0, this.width, this.height);

        // And get an array with all imgage data we can process later on
        this.imgdata = this.ctx.getImageData(0, 0, this.width, this.height);
    }
};