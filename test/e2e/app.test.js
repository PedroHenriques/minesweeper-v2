const chai = require('chai');
const assert = chai.assert;
const puppeteer = require('puppeteer');

describe('App', function () {
  let browser;
  let page;

  beforeEach(async function () {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(async function () {
    await browser.close();
  });

  describe('on the landing page', function () {
    it('should render the game setup', async function () {
      await page.goto('http://localhost:9000');
      const elemsData = await page.$eval('#setup', (setupElem) => {
        const returnValue = [];

        for (const child of setupElem.children) {
          const children = [];
          for (const innerChild of child.children) {
            children.push(innerChild.outerHTML);
          }

          returnValue.push({
            tag: child.tagName,
            children,
            id: child.id,
            text: child.innerText
          });
        }

        return(returnValue);
      });

      assert.strictEqual(elemsData.length, 5);
      assert.strictEqual(elemsData[0].tag, 'P');
      assert.strictEqual(elemsData[0].text, 'Difficulty:\nBeginner (9x9 - 10 mines)\nIntermediate (16x16 - 40 mines)\nExpert (16x30 - 99 mines)');
      assert.strictEqual(elemsData[0].children.length, 1);
      assert.match(elemsData[0].children[0], /^\<select /i);
      assert.match(elemsData[0].children[0], / id=['"]difficulty['"][ >]/i);
      assert.match(
        elemsData[0].children[0],
        /\>\<option value=['"]0['"]\>Beginner \(9x9 - 10 mines\)\<\/option\>\<option value=['"]1['"]\>Intermediate \(16x16 - 40 mines\)\<\/option\>\<option value=['"]2['"]\>Expert \(16x30 - 99 mines\)\<\/option\>\<\/select\>/i
      );
      assert.strictEqual(elemsData[1].tag, 'P');
      assert.strictEqual(elemsData[1].children.length, 2);
      assert.match(elemsData[1].children[0], /^\<input /i);
      assert.match(elemsData[1].children[0], / type=['"]checkbox['"](\s|\>)/i);
      assert.match(elemsData[1].children[0], / id=['"]flags-enabled['"](\s|\>)/i);
      assert.match(elemsData[1].children[0], / checked=""(\s|\>)/i);
      assert.match(elemsData[1].children[1], /^\<label /i);
      assert.match(elemsData[1].children[1], / for=['"]flags-enabled['"](\s|\>)/i);
      assert.match(elemsData[1].children[1], /\>Enable flags\<\/label\>$/i);
      assert.strictEqual(elemsData[2].tag, 'P');
      assert.strictEqual(elemsData[2].text, 'Number of lives:');
      assert.strictEqual(elemsData[2].children.length, 1);
      assert.match(elemsData[2].children[0], /^\<input /i);
      assert.match(elemsData[2].children[0], / type=['"]number['"](\s|>)/i);
      assert.match(elemsData[2].children[0], / id=['"]number-lives['"](\s|>)/i);
      assert.match(elemsData[2].children[0], / value=['"]1['"](\s|>)/i);
      assert.strictEqual(elemsData[3].tag, 'P');
      assert.strictEqual(elemsData[3].text, 'Seed:');
      assert.strictEqual(elemsData[3].children.length, 2);
      assert.match(elemsData[3].children[0], /^\<input /i);
      assert.match(elemsData[3].children[0], / type=['"]text['"](\s|>)/i);
      assert.match(elemsData[3].children[0], / id=['"]game-seed['"](\s|>)/i);
      assert.match(elemsData[3].children[1], /^\<img /i);
      assert.match(elemsData[3].children[1], / src=['"]\/img\/dice\.png['"](\s|>)/i);
      assert.match(elemsData[3].children[1], / title=['"]Generate new seed!['"](\s|>)/i);
      assert.match(elemsData[3].children[1], / alt=['"]generate new seed['"](\s|>)/i);
      assert.strictEqual(elemsData[4].tag, 'BUTTON');
      assert.strictEqual(elemsData[4].text, 'Start Game');
      assert.strictEqual(elemsData[4].id, 'start-button');
    });

    describe('when the "start game" button is pressed', function () {
      it('should render the menu, the game header and the game minefield', async function () {
        await page.goto('http://localhost:9000');
        await page.click('#start-button');
        const menuElemsData = await page.$eval('#menu', (menuElem) => {
          const returnValue = [];

          for (const child of menuElem.children) {
            const children = [];
            for (const innerChild of child.children) {
              children.push(innerChild.outerHTML);
            }

            returnValue.push({
              tag: child.tagName,
              children: children,
              id: child.id,
              text: child.innerText
            });
          }

          return(returnValue);
        });
        const headerElemsData = await page.$eval('#header', (headerElem) => {
          const returnValue = [];

          for (const child of headerElem.children) {
            const children = [];
            for (const innerChild of child.children) {
              children.push(innerChild.outerHTML);
            }

            returnValue.push({
              tag: child.tagName,
              children: children,
              id: child.id,
              text: child.innerText
            });
          }

          return(returnValue);
        });
        const minefieldElemsData = await page.$eval('#minefield', (minefieldElem) => {
          const returnValue = [];

          for (const child of minefieldElem.children) {
            const children = [];
            for (const innerChild of child.children) {
              children.push(innerChild.outerHTML);
            }

            returnValue.push({
              tag: child.tagName,
              children: children,
              id: child.id,
              text: child.innerText
            });
          }

          return(returnValue);
        });

        assert.strictEqual(menuElemsData.length, 3);
        assert.strictEqual(menuElemsData[0].tag, 'BUTTON');
        assert.strictEqual(menuElemsData[0].id, 'new-game-button');
        assert.strictEqual(menuElemsData[0].text, 'New Game');
        assert.strictEqual(menuElemsData[1].tag, 'BUTTON');
        assert.strictEqual(menuElemsData[1].id, 'reset-game-button');
        assert.strictEqual(menuElemsData[1].text, 'Reset Game');
        assert.strictEqual(menuElemsData[2].tag, 'A');
        assert.strictEqual(menuElemsData[2].id, '');
        assert.strictEqual(menuElemsData[2].text, 'Source Code');
        assert.strictEqual(headerElemsData.length, 3);
        assert.strictEqual(headerElemsData[0].tag, 'DIV');
        assert.strictEqual(headerElemsData[0].id, 'game-timer');
        assert.strictEqual(headerElemsData[0].text, '00:00');
        assert.strictEqual(headerElemsData[0].children.length, 1);
        assert.match(headerElemsData[0].children[0], /^\<img /i);
        assert.match(headerElemsData[0].children[0], / src=['"]\/img\/timer\.png['"](\s|\>)/i);
        assert.match(headerElemsData[0].children[0], / alt=['"]game timer['"](\s|\>)/i);
        assert.strictEqual(headerElemsData[1].tag, 'DIV');
        assert.strictEqual(headerElemsData[1].id, 'mines-left');
        assert.strictEqual(headerElemsData[1].text, '10');
        assert.strictEqual(headerElemsData[1].children.length, 1);
        assert.match(headerElemsData[1].children[0], /^\<img /i);
        assert.match(headerElemsData[1].children[0], / src=['"]\/img\/mine\.png['"](\s|>)/i);
        assert.match(headerElemsData[1].children[0], / alt=['"]mines left['"](\s|>)/i);
        assert.strictEqual(headerElemsData[2].tag, 'DIV');
        assert.strictEqual(headerElemsData[2].id, 'lives');
        assert.strictEqual(headerElemsData[2].text, '1');
        assert.strictEqual(headerElemsData[2].children.length, 1);
        assert.match(headerElemsData[2].children[0], /^\<img /i);
        assert.match(headerElemsData[2].children[0], / src=['"]\/img\/lives\.png['"](\s|>)/i);
        assert.match(headerElemsData[2].children[0], / alt=['"]lives left['"](\s|>)/i);
        assert.strictEqual(minefieldElemsData.length, 81);
        assert.strictEqual(minefieldElemsData[0].tag, 'DIV');
        assert.strictEqual(minefieldElemsData[0].id, 'tile-0');
        assert.strictEqual(minefieldElemsData[80].tag, 'DIV');
        assert.strictEqual(minefieldElemsData[80].id, 'tile-80');
      });
    });
  });

  describe('when a game is running', function () {
    beforeEach(async function () {
      await page.goto('http://localhost:9000');
      await page.focus('#game-seed');
      await page.keyboard.press('Home');
      await page.keyboard.down('Shift');
      await page.keyboard.press('End');
      await page.keyboard.up('Shift');
      await page.keyboard.type('test seed');
      await page.click('#start-button');
    });

    describe('on a LMB click in a non revealed tile', function () {
      it('should reveal the necessary tiles', async function () {
        const tileSelector = '#tile-73';
        await page.click(tileSelector);
        const tileText = await page.$eval(tileSelector, (elem) => {
          return(elem.innerHTML);
        });

        assert.deepEqual(tileText, '<span>1</span>');
      });
    });

    describe('on a RMB click in a non revealed tile', function () {
      it('should add a flag to that tile', async function () {
        const tileSelector = '#tile-74';
        await page.click(tileSelector, { button: 'right' });
        const tileData = await page.$eval(tileSelector, (elem) => {
          return({
            className: elem.className,
          });
        });

        assert.deepEqual(tileData, {
          className: 'tile flag',
        });
      });
    });

    describe('if all valid tiles are revealed', function () {
      it('should show win end game message', async function () {
        await page.click('#tile-0');
        await page.click('#tile-47');
        await page.click('#tile-48');
        await page.click('#tile-57');
        await page.click('#tile-65');
        await page.click('#tile-58');
        await page.click('#tile-60');
        await page.click('#tile-61');
        await page.click('#tile-50');
        await page.click('#tile-51');
        await page.click('#tile-52');
        await page.click('#tile-62');
        await page.click('#tile-80');

        const elemsData = await page.$eval('#game-notifs', (gameNotifsElem) => {
          const returnValue = [];

          for (const child of gameNotifsElem.children) {
            const children = [];
            for (const innerChild of child.children) {
              children.push(innerChild.outerHTML);
            }

            returnValue.push({
              tag: child.tagName,
              children: children,
              id: child.id,
              text: child.innerText
            });
          }

          return(returnValue);
        });

        assert.strictEqual(elemsData.length, 2);
        assert.strictEqual(elemsData[0].tag, 'P');
        assert.deepEqual(elemsData[0].children, []);
        assert.strictEqual(elemsData[0].id, '');
        assert.strictEqual(elemsData[0].text, 'Congratulations!');
        assert.strictEqual(elemsData[1].tag, 'BUTTON');
        assert.deepEqual(elemsData[1].children, []);
        assert.strictEqual(elemsData[1].id, 'notification-ok');
        assert.strictEqual(elemsData[1].text, 'Ok');
      });
    });

    describe('if all lives are lost', function () {
      it('should show loss end game message', async function () {
        await page.click('#tile-74');

        const elemsData = await page.$eval('#game-notifs', (gameNotifsElem) => {
          const returnValue = [];

          for (const child of gameNotifsElem.children) {
            const children = [];
            for (const innerChild of child.children) {
              children.push(innerChild.outerHTML);
            }

            returnValue.push({
              tag: child.tagName,
              children: children,
              id: child.id,
              text: child.innerText
            });
          }

          return(returnValue);
        });

        assert.strictEqual(elemsData.length, 2);
        assert.strictEqual(elemsData[0].tag, 'P');
        assert.deepEqual(elemsData[0].children, []);
        assert.strictEqual(elemsData[0].id, '');
        assert.strictEqual(elemsData[0].text, 'Game Over!');
        assert.strictEqual(elemsData[1].tag, 'BUTTON');
        assert.deepEqual(elemsData[1].children, []);
        assert.strictEqual(elemsData[1].id, 'notification-ok');
        assert.strictEqual(elemsData[1].text, 'Ok');
      });
    });

    describe('if the "new game" button is pressed', function () {
      it('should end the current game and render the game setup', async function () {
        await page.click('#new-game-button');
        assert.isNotNull(await page.$('#setup'));
        assert.isNull(await page.$('#game'));
      });
    });

    describe('if the "reset game" button is pressed', function () {
      it('should end the current game and render a new game with the exact minefield', async function () {
        await page.click('#tile-0');
        await page.click('#tile-47');
        await page.click('#tile-48');
        await page.click('#tile-57');
        await page.click('#tile-65');
        await page.click('#tile-58');
        await page.click('#tile-60');
        await page.click('#tile-61');
        await page.click('#tile-50');
        await page.click('#tile-51');
        await page.click('#tile-52');
        await page.click('#tile-62');
        await page.click('#tile-80');
        assert.isNotNull(await page.$('#game-notifs'));

        await page.click('#reset-game-button');
        assert.isNull(await page.$('#game-notifs'));
        
        await page.click('#tile-0');
        await page.click('#tile-47');
        await page.click('#tile-48');
        await page.click('#tile-57');
        await page.click('#tile-65');
        await page.click('#tile-58');
        await page.click('#tile-60');
        await page.click('#tile-61');
        await page.click('#tile-50');
        await page.click('#tile-51');
        await page.click('#tile-52');
        await page.click('#tile-62');
        await page.click('#tile-80');
        assert.isNotNull(await page.$('#game-notifs'));
      });
    });
  });

  describe('if the viewport resizes while a game is running', function () {
    beforeEach(async function () {
      await page.goto('http://localhost:9000');
      await page.select('#difficulty', '2');
      await page.focus('#game-seed');
      await page.keyboard.press('Home');
      await page.keyboard.down('Shift');
      await page.keyboard.press('End');
      await page.keyboard.up('Shift');
      await page.keyboard.type('test seed');
      await page.click('#start-button');
    });

    it('should adjust the minefield tiles size to prevent overflow', async function () {
      await page.setViewport({ width: 2000, height: 2000 });
      assert.deepEqual(
        await page.$eval('#app', (elem) => {
          const appBB = elem.getBoundingClientRect();
          return({
            vs: appBB.bottom > window.innerHeight,
            hs: appBB.right > window.innerWidth,
            vpHeight: window.innerHeight,
            vpWidth: window.innerWidth,
          });
        }),
        { vs: false, hs: false, vpHeight: 2000, vpWidth: 2000 }
      );
      
      await page.setViewport({ width: 500, height: 500 });
      assert.deepEqual(
        await page.$eval('#app', (elem) => {
          const appBB = elem.getBoundingClientRect();
          return({
            vs: appBB.bottom > window.innerHeight,
            hs: appBB.right > window.innerWidth,
            vpHeight: window.innerHeight,
            vpWidth: window.innerWidth,
          });
        }),
        { vs: false, hs: false, vpHeight: 500, vpWidth: 500 }
      );
    });

    describe('if the viewport goes below the minimum width and/or height', function () {
      it('should let the minefield overflow', async function () {
        await page.setViewport({ width: 200, height: 200 });
        assert.deepEqual(
          await page.$eval('#app', (elem) => {
            const appBB = elem.getBoundingClientRect();
            return({
              vs: appBB.bottom > window.innerHeight,
              hs: appBB.right > window.innerWidth,
              vpHeight: window.innerHeight,
              vpWidth: window.innerWidth,
            });
          }),
          { vs: true, hs: true, vpHeight: 200, vpWidth: 200 }
        );
      });
    });
  });
});