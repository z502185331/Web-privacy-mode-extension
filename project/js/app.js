var main = function() {
  $('.article').click(function() {
      $(this).find('.description').slideToggle();
      $('.current').find('.description').slideUp();
      $('.current').removeClass('current');
      $(this).addClass('current');
  });

  $(document).keypress(function(event) {
    if(event.which === 111) {
      $('.description').hide();

      $('.current').children('.description').show();
    }

    else if(event.which === 110) {
      var currentArticle = $('.current');
      var nextArticle = currentArticle.next();
      
      currentArticle.removeClass('current');
      nextArticle.addClass('current');
    }
  });
}

$(document).ready(main);