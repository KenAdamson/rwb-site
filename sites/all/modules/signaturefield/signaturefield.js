
(function ($) {
  $(document).ready(function() {
    //var sig = Drupal.settings.signaturefield.sig || null;
    $('form .sig').each(function(){
      var api = $(this).parent().signaturePad(Drupal.settings.signaturefield.settings);
      //regenerate existing signature when editing content
      setTimeout(function(){api.regenerate(Drupal.settings.signaturefield.sig)}, 60);
    });
  });
})(jQuery);
