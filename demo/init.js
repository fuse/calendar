document.observe("dom:loaded", function() {
  $$('img.calendar').each(function(node) {
    node.observe('click', function(e) {
      c = Calendar.getInstance(e, { weekNumbers: true });
      if(c) c.display();
    });
  });
});