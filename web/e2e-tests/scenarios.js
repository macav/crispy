'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Freshy app', function() {

  browser.get('index.html');

  beforeEach(function() {

  });

  it('should automatically redirect to login when location hash/fragment is empty and we dont have oauth token', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/login");
  });


  describe('view1', function() {

    beforeEach(function() {
      browser.get('index.html#/view1');
    });


    it('should render view1 when user navigates to /view1', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 1/);
    });

  });


  describe('view2', function() {

    beforeEach(function() {
      browser.get('index.html#/view2');
    });


    it('should render view2 when user navigates to /view2', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
