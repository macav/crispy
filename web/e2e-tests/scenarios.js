'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Freshy app', function() {

  browser.get('index.html');

  it('should automatically redirect to login when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/login");
  });

  it('should login and redirect to main state', function() {
    element(by.model('login.username')).sendKeys('user1');
    element(by.model('login.password')).sendKeys('pass1');
    element(by.buttonText('Login')).click().then(function() {


      describe('Main state', function() {
        it ('should be in main state', function() {
          expect(browser.getLocationAbsUrl()).toMatch('/main');
          expect(element.all(by.css('p')).first().getText()).toMatch('Choose a conversation from the list');
        });
      });
    });
  });


  //describe('view1', function() {
  //
  //  beforeEach(function() {
  //    browser.get('index.html#/view1');
  //  });
  //
  //
  //  it('should render view1 when user navigates to /view1', function() {
  //    expect(element.all(by.css('[ng-view] p')).first().getText()).
  //      toMatch(/partial for view 1/);
  //  });
  //
  //});
  //
  //
  //describe('view2', function() {
  //
  //  beforeEach(function() {
  //    browser.get('index.html#/view2');
  //  });
  //
  //
  //  it('should render view2 when user navigates to /view2', function() {
  //    expect(element.all(by.css('[ng-view] p')).first().getText()).
  //      toMatch(/partial for view 2/);
  //  });
  //
  //});
});
