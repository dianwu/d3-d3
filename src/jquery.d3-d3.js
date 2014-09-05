/*
 * d3-d3
 * https://github.com/dianwu/d3-d3
 *
 * Copyright (c) 2014 dianwu
 * Licensed under the MIT license.
 */

(function($) {

  // Collection method.
  $.fn.d3_d3 = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.d3_d3 = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.d3_d3.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.d3_d3.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].d3_d3 = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
